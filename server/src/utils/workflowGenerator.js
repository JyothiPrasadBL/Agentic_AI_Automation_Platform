function node(id, type, label, x, y, config = {}) { return { id, type: 'default', position: { x, y }, data: { type, label, config } }; }
function edge(source, target) { return { id: `edge-${source}-${target}`, source, target, animated: true }; }

function deterministicWorkflow(prompt) {
  const text = prompt.toLowerCase();
  const nodes = [node('trigger-1', 'manual-trigger', 'Start manually', 80, 180)]; const edges = [];
  let previous = 'trigger-1';
  const append = (type, label, config = {}) => { const id = `${type}-${nodes.length}`; nodes.push(node(id, type, label, 300 + nodes.length * 80, 180, config)); edges.push(edge(previous, id)); previous = id; };
  if (/(read|inbox|incoming).*(email|gmail)|(email|gmail).*(read|inbox|incoming)/.test(text)) append('gmail-read', 'Read Gmail messages');
  if (/(invoice|route|condition|if )/.test(text)) append('condition', 'Route by condition', { expression: 'input.category === "invoice"' });
  if (/(send|email|gmail)/.test(text) && !/(read|inbox|incoming).*(email|gmail)/.test(text)) append('gmail-send', 'Send email', { to: '', subject: '', message: prompt });
  if (/(slack)/.test(text)) append('slack-message', 'Post Slack message', { channel: '', message: prompt });
  if (/(discord)/.test(text)) append('discord-message', 'Post Discord message', { channel: '', message: prompt });
  if (/(sheet|spreadsheet|append row|google sheets)/.test(text)) append('sheets-append', 'Append Google Sheets row', { spreadsheetId: '', values: [] });
  if (nodes.length === 1) append('ai-prompt', 'Process with AI', { prompt });
  return { name: prompt.slice(0, 72).replace(/\.$/, '') || 'Generated workflow', description: `Generated from: ${prompt}`, status: 'draft', trigger: { type: 'manual' }, nodes, edges, tags: ['ai-generated'] };
}

function validateGeneratedWorkflow(candidate, prompt) {
  if (!candidate || !Array.isArray(candidate.nodes) || !Array.isArray(candidate.edges) || !candidate.nodes.length) return deterministicWorkflow(prompt);
  const ids = new Set();
  const nodes = candidate.nodes.map((item, index) => {
    const id = String(item.id || `node-${index + 1}`); ids.add(id);
    return node(id, String(item.data?.type || item.type || 'ai-prompt'), String(item.data?.label || item.label || 'Workflow step'), Number(item.position?.x || index * 200), Number(item.position?.y || 180), item.data?.config || item.config || {});
  });
  const edges = candidate.edges.filter((item) => ids.has(item.source) && ids.has(item.target)).map((item, index) => ({ id: item.id || `edge-${index}`, source: item.source, target: item.target, animated: true }));
  if (!nodes.some((item) => item.data.type.includes('trigger'))) nodes.unshift(node('trigger-1', 'manual-trigger', 'Start manually', 60, 180));
  return { name: String(candidate.name || 'Generated workflow').slice(0, 120), description: String(candidate.description || `Generated from: ${prompt}`).slice(0, 2000), status: 'draft', trigger: { type: 'manual' }, nodes, edges, tags: ['ai-generated'] };
}

module.exports = { deterministicWorkflow, validateGeneratedWorkflow };
