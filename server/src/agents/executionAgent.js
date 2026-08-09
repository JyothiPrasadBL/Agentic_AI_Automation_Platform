const integrationTypes = new Set(['gmail-read', 'gmail-send', 'slack-message', 'discord-message', 'sheets-append']);
const integrations = require('../services/integrationService');

async function executeNode(node, context) {
  const type = node.data?.type || node.type;
  const config = node.data?.config || {};
  if (type === 'manual-trigger' || type === 'schedule-trigger') return { triggered: true, input: context.input };
  if (type === 'ai-prompt') return { text: `AI processing completed for: ${config.prompt || config.message || 'workflow input'}` };
  if (type === 'condition') return { matched: true, expression: config.expression || 'true' };
  if (integrationTypes.has(type)) {
    const provider = type.startsWith('sheets-') ? 'google-sheets' : type.startsWith('gmail-') ? 'gmail' : type.startsWith('slack-') ? 'slack' : 'discord';
    integrations.getConnected(context.ownerId, provider);
    return { simulated: true, provider, action: type, config };
  }
  return { completed: true, nodeType: type };
}
module.exports = { executeNode, integrationTypes };
