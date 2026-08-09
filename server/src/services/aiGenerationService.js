const { openRouterApiKey, geminiApiKey } = require('../config/env');
const { deterministicWorkflow, validateGeneratedWorkflow } = require('../utils/workflowGenerator');

const systemPrompt = 'Return only valid JSON for a runnable React Flow automation graph. Schema: {name,description,nodes:[{id,position:{x,y},data:{type,label,config}}],edges:[{id,source,target}]}. Include a manual-trigger node. Valid action types: gmail-read,gmail-send,slack-message,discord-message,sheets-append,ai-prompt,condition.';

function parseJson(content) {
  const match = content.match(/\{[\s\S]*\}/); if (!match) throw new Error('Provider did not return a workflow JSON object.'); return JSON.parse(match[0]);
}

async function fromOpenRouter(prompt) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${openRouterApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'google/gemini-2.0-flash-001', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }], temperature: 0.2 }) });
  if (!response.ok) throw new Error(`OpenRouter returned ${response.status}.`);
  const data = await response.json(); return parseJson(data.choices?.[0]?.message?.content || '');
}

async function fromGemini(prompt) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
  const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\nUser request: ${prompt}` }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } }) });
  if (!response.ok) throw new Error(`Gemini returned ${response.status}.`);
  const data = await response.json(); return parseJson(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
}

async function generateWorkflow(prompt) {
  let provider = 'deterministic'; let candidate;
  try {
    if (openRouterApiKey) { provider = 'openrouter'; candidate = await fromOpenRouter(prompt); }
    else if (geminiApiKey) { provider = 'gemini'; candidate = await fromGemini(prompt); }
    else candidate = deterministicWorkflow(prompt);
    return { workflow: validateGeneratedWorkflow(candidate, prompt), provider, fallbackUsed: false };
  } catch (error) {
    return { workflow: deterministicWorkflow(prompt), provider: 'deterministic', fallbackUsed: true, providerError: error.message };
  }
}

module.exports = { generateWorkflow };
