async function plan({ workflow }) {
  const nodeById = new Map(workflow.nodes.map((node) => [node.id, node]));
  const outgoing = new Map(); const incoming = new Map();
  for (const node of workflow.nodes) { outgoing.set(node.id, []); incoming.set(node.id, 0); }
  for (const edge of workflow.edges) { if (outgoing.has(edge.source) && incoming.has(edge.target)) { outgoing.get(edge.source).push(edge.target); incoming.set(edge.target, incoming.get(edge.target) + 1); } }
  const ready = workflow.nodes.filter((node) => incoming.get(node.id) === 0).map((node) => node.id); const order = [];
  while (ready.length) { const id = ready.shift(); order.push(nodeById.get(id)); for (const target of outgoing.get(id)) { incoming.set(target, incoming.get(target) - 1); if (incoming.get(target) === 0) ready.push(target); } }
  const orderedNodes = order.length === workflow.nodes.length ? order : workflow.nodes;
  return { orderedNodes, confidence: order.length === workflow.nodes.length ? 0.98 : 0.6, cycleDetected: order.length !== workflow.nodes.length };
}
module.exports = { plan };
