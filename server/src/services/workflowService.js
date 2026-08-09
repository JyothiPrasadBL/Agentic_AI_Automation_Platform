const workflows = [];

const statuses = new Set(['draft', 'active', 'paused', 'archived']);

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function normalize(payload = {}) {
  return {
    name: String(payload.name || 'Untitled workflow').trim(),
    description: String(payload.description || '').trim(),
    status: statuses.has(payload.status) ? payload.status : 'draft',
    trigger: payload.trigger || { type: 'manual' },
    nodes: Array.isArray(payload.nodes) ? payload.nodes : [],
    edges: Array.isArray(payload.edges) ? payload.edges : [],
    tags: Array.isArray(payload.tags) ? payload.tags.map(String).map((tag) => tag.trim()).filter(Boolean) : []
  };
}

function ownership(workflow, ownerId) {
  if (!workflow || workflow.ownerId !== ownerId) {
    const error = new Error('Workflow not found.'); error.statusCode = 404; throw error;
  }
}

function listWorkflows(ownerId, { search = '', status, page = 1, limit = 20 } = {}) {
  const query = search.trim().toLowerCase();
  const filtered = workflows.filter((workflow) => workflow.ownerId === ownerId && (!status || workflow.status === status) && (!query || `${workflow.name} ${workflow.description} ${workflow.tags.join(' ')}`.toLowerCase().includes(query))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const currentPage = Math.max(Number(page) || 1, 1); const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
  return { data: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(clone), pagination: { page: currentPage, limit: pageSize, total: filtered.length, pages: Math.ceil(filtered.length / pageSize) } };
}

function createWorkflow(ownerId, payload) {
  const now = new Date().toISOString();
  const workflow = { id: crypto.randomUUID(), ownerId, ...normalize(payload), version: 1, executionCount: 0, lastExecutionAt: null, createdAt: now, updatedAt: now };
  workflows.push(workflow); return clone(workflow);
}

function getWorkflow(ownerId, id) { const workflow = workflows.find((item) => item.id === id); ownership(workflow, ownerId); return clone(workflow); }

function updateWorkflow(ownerId, id, payload) {
  const workflow = workflows.find((item) => item.id === id); ownership(workflow, ownerId);
  Object.assign(workflow, normalize({ ...workflow, ...payload }), { version: workflow.version + 1, updatedAt: new Date().toISOString() });
  return clone(workflow);
}

function duplicateWorkflow(ownerId, id) {
  const original = workflows.find((item) => item.id === id); ownership(original, ownerId);
  return createWorkflow(ownerId, { ...original, name: `${original.name} (copy)`, status: 'draft', nodes: original.nodes, edges: original.edges });
}

function deleteWorkflow(ownerId, id) {
  const position = workflows.findIndex((item) => item.id === id); ownership(workflows[position], ownerId); workflows.splice(position, 1);
}

function dashboard(ownerId) {
  const mine = workflows.filter((workflow) => workflow.ownerId === ownerId);
  return { metrics: { totalWorkflows: mine.length, activeWorkflows: mine.filter((workflow) => workflow.status === 'active').length, totalExecutions: mine.reduce((total, workflow) => total + workflow.executionCount, 0), successRate: 0 }, recentWorkflows: mine.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5).map(clone), activity: [] };
}

module.exports = { listWorkflows, createWorkflow, getWorkflow, updateWorkflow, duplicateWorkflow, deleteWorkflow, dashboard };
