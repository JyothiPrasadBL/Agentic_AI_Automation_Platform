const notifications = require('../services/notificationService');
function list(req, res, next) { try { res.json({ notifications: notifications.list(req.user.id) }); } catch (error) { next(error); } }
function markRead(req, res, next) { try { res.json({ notification: notifications.markRead(req.user.id, req.params.id) }); } catch (error) { next(error); } }
module.exports = { list, markRead };
