const { emitToUser } = require('../config/socket');
const notifications = [];
const clone = (value) => JSON.parse(JSON.stringify(value));
function create({ ownerId, workflowId = null, executionId = null, type, title, message }) { const item = { id: crypto.randomUUID(), ownerId, workflowId, executionId, type, title, message, read: false, createdAt: new Date().toISOString() }; notifications.push(item); emitToUser(ownerId, 'notification', clone(item)); return clone(item); }
function list(ownerId) { return notifications.filter((item) => item.ownerId === ownerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(clone); }
function markRead(ownerId, id) { const item = notifications.find((entry) => entry.id === id && entry.ownerId === ownerId); if (!item) { const error = new Error('Notification not found.'); error.statusCode = 404; throw error; } item.read = true; return clone(item); }
module.exports = { create, list, markRead };
