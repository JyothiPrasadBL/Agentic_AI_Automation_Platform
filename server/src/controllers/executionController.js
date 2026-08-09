const executions = require('../services/executionService');
function list(req, res, next) { try { res.json(executions.list(req.user.id, req.query)); } catch (error) { next(error); } }
function get(req, res, next) { try { res.json({ execution: executions.get(req.user.id, req.params.id) }); } catch (error) { next(error); } }
function timeline(req, res, next) { try { res.json({ logs: executions.timeline(req.user.id, req.params.id) }); } catch (error) { next(error); } }
function pause(req, res, next) { try { res.json({ execution: executions.pause(req.user.id, req.params.id) }); } catch (error) { next(error); } }
function resume(req, res, next) { try { res.json({ execution: executions.resume(req.user.id, req.params.id) }); } catch (error) { next(error); } }
function cancel(req, res, next) { try { res.json({ execution: executions.cancel(req.user.id, req.params.id) }); } catch (error) { next(error); } }
module.exports = { list, get, timeline, pause, resume, cancel };
