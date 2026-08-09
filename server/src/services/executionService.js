const workflows = require('./workflowService');
const { run, langGraphStatus } = require('../agents/orchestrator');
const { enqueue, mode: queueMode } = require('../queues/executionQueue');
const { emitToUser } = require('../config/socket');
const notifications = require('./notificationService');

const executions = []; const logs = []; const MAX_RETRIES = 3;
const clone = (value) => JSON.parse(JSON.stringify(value));
function owned(execution, ownerId) { if (!execution || execution.ownerId !== ownerId) { const error = new Error('Execution not found.'); error.statusCode = 404; throw error; } }
function duration(execution) { return execution.completedAt ? new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime() : null; }
function publicExecution(execution) { return { ...clone(execution), duration: duration(execution) }; }

async function addLog(execution, item) {
  const log = { id: crypto.randomUUID(), executionId: execution.id, workflowId: execution.workflowId, timestamp: new Date().toISOString(), nodeId: item.metadata?.nodeId || null, agent: item.agent, level: item.level, eventType: item.eventType, message: item.message, metadata: item.metadata };
  logs.push(log); emitToUser(execution.ownerId, 'execution:event', log); return log;
}

async function process(execution) {
  if (execution.status === 'CANCELLED' || execution.status === 'PAUSED') return;
  execution.status = 'RUNNING'; if (!execution.startedAt) execution.startedAt = new Date().toISOString();
  const result = await run({ workflow: execution.workflowSnapshot, input: execution.input, ownerId: execution.ownerId, retryCount: execution.retryCount, isCancelled: () => execution.status === 'CANCELLED', isPaused: () => execution.status === 'PAUSED', log: (item) => addLog(execution, item) });
  execution.output = result.output; execution.langGraph = result.langGraph;
  if (result.status === 'RETRYING' && execution.retryCount < MAX_RETRIES) {
    execution.status = 'RETRYING'; execution.retryCount += 1; execution.error = result.error; await addLog(execution, { agent: 'monitoring', eventType: 'RETRY_SCHEDULED', message: `Retry ${execution.retryCount} scheduled.`, metadata: result.recovery, level: 'warning' });
    await enqueue(execution.id, processById, Math.min(result.recovery.retryAfterMs, 5000)); return;
  }
  execution.status = result.status; execution.error = result.error || null;
  if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(result.status)) {
    execution.completedAt = new Date().toISOString();
    if (result.status === 'COMPLETED') notifications.create({ ownerId: execution.ownerId, workflowId: execution.workflowId, executionId: execution.id, type: 'success', title: 'Workflow completed', message: `${execution.workflowSnapshot.name} completed successfully.` });
    if (result.status === 'FAILED') notifications.create({ ownerId: execution.ownerId, workflowId: execution.workflowId, executionId: execution.id, type: 'failure', title: 'Workflow escalation required', message: result.error?.message || `${execution.workflowSnapshot.name} failed.` });
  }
}

async function processById(id) { const execution = executions.find((item) => item.id === id); if (execution) await process(execution); }

function create(ownerId, workflowId, input = {}) {
  const workflow = workflows.getWorkflow(ownerId, workflowId); const now = new Date().toISOString();
  const execution = { id: crypto.randomUUID(), ownerId, workflowId, workflowSnapshot: clone(workflow), status: 'PENDING', input, output: null, error: null, retryCount: 0, currentNodeId: null, startedAt: null, completedAt: null, createdAt: now, langGraph: langGraphStatus() };
  executions.push(execution); enqueue(execution.id, processById); return { ...publicExecution(execution), queue: queueMode() };
}
function list(ownerId, query = {}) { const filtered = executions.filter((item) => item.ownerId === ownerId && (!query.status || item.status === query.status)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); return { data: filtered.map(publicExecution), total: filtered.length }; }
function get(ownerId, id) { const execution = executions.find((item) => item.id === id); owned(execution, ownerId); return publicExecution(execution); }
function timeline(ownerId, id) { const execution = executions.find((item) => item.id === id); owned(execution, ownerId); return logs.filter((item) => item.executionId === id).map(clone); }
function pause(ownerId, id) { const execution = executions.find((item) => item.id === id); owned(execution, ownerId); if (!['PENDING', 'RUNNING', 'RETRYING'].includes(execution.status)) { const error = new Error(`Cannot pause a ${execution.status} execution.`); error.statusCode = 409; throw error; } execution.status = 'PAUSED'; addLog(execution, { agent: 'monitoring', eventType: 'EXECUTION_PAUSED', message: 'Execution was paused by the operator.', metadata: {}, level: 'warning' }); return publicExecution(execution); }
function resume(ownerId, id) { const execution = executions.find((item) => item.id === id); owned(execution, ownerId); if (execution.status !== 'PAUSED') { const error = new Error('Only paused executions can be resumed.'); error.statusCode = 409; throw error; } execution.status = 'PENDING'; addLog(execution, { agent: 'monitoring', eventType: 'EXECUTION_RESUMED', message: 'Execution was resumed by the operator.', metadata: {}, level: 'info' }); enqueue(execution.id, processById); return publicExecution(execution); }
function cancel(ownerId, id) { const execution = executions.find((item) => item.id === id); owned(execution, ownerId); if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(execution.status)) { const error = new Error(`Cannot cancel a ${execution.status} execution.`); error.statusCode = 409; throw error; } execution.status = 'CANCELLED'; execution.completedAt = new Date().toISOString(); addLog(execution, { agent: 'monitoring', eventType: 'EXECUTION_CANCELLED', message: 'Execution was cancelled by the operator.', metadata: {}, level: 'warning' }); notifications.create({ ownerId: execution.ownerId, workflowId: execution.workflowId, executionId: execution.id, type: 'warning', title: 'Workflow cancelled', message: `${execution.workflowSnapshot.name} was cancelled.` }); return publicExecution(execution); }
module.exports = { create, list, get, timeline, pause, resume, cancel };
