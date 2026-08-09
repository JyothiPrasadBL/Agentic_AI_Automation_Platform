const { plan } = require('./plannerAgent');
const { executeNode } = require('./executionAgent');
const { validate } = require('./validationAgent');
const { recover } = require('./recoveryAgent');
const { event } = require('./monitoringAgent');

let langGraph = 'not-installed';
try { require.resolve('@langchain/langgraph'); langGraph = 'available'; } catch { /* optional dependency */ }

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run({ workflow, input, ownerId, retryCount, isCancelled, isPaused, log }) {
  const planResult = await plan({ workflow, input });
  await log(event('planner', 'PLAN_CREATED', 'Planner produced node execution order.', { confidence: planResult.confidence, nodeCount: planResult.orderedNodes.length, cycleDetected: planResult.cycleDetected }, 'success'));
  const output = {};
  for (const node of planResult.orderedNodes) {
    if (isCancelled()) return { status: 'CANCELLED', output, langGraph };
    if (isPaused()) return { status: 'PAUSED', output, langGraph };
    const nodeType = node.data?.type || node.type;
    await log(event('monitoring', 'NODE_STARTED', `Starting ${node.data?.label || nodeType}.`, { nodeId: node.id, nodeType }));
    try {
      const result = await executeNode(node, { input, output, ownerId });
      await log(event('execution', 'NODE_COMPLETED', `Executed ${node.data?.label || nodeType}.`, { nodeId: node.id, output: result }, 'success'));
      const validation = validate({ node, output: result });
      if (!validation.valid) throw new Error(`Missing required output fields: ${validation.missingFields.join(', ')}`);
      await log(event('validation', 'NODE_VALIDATED', `Validated output for ${node.data?.label || nodeType}.`, { nodeId: node.id }, 'success'));
      output[node.id] = result;
      await wait(20);
    } catch (error) {
      const recovery = recover(error, retryCount);
      await log(event('recovery', recovery.classification, `Recovery decision: ${recovery.action}.`, { nodeId: node.id, ...recovery, error: error.message }, recovery.action === 'escalate' ? 'error' : 'warning'));
      return { status: recovery.action === 'retry_with_backoff' ? 'RETRYING' : 'FAILED', output, error: { message: error.message, classification: recovery.classification }, recovery, langGraph };
    }
  }
  await log(event('monitoring', 'EXECUTION_COMPLETED', 'All workflow nodes completed.', { nodeCount: planResult.orderedNodes.length }, 'success'));
  return { status: 'COMPLETED', output, langGraph };
}
module.exports = { run, langGraphStatus: () => langGraph };
