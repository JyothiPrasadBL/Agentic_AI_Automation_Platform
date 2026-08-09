const { validationResult } = require('express-validator');
const workflows = require('../services/workflowService');
const { generateWorkflow } = require('../services/aiGenerationService');
const executions = require('../services/executionService');

function check(req) { const result = validationResult(req); if (!result.isEmpty()) { const error = new Error('Validation failed.'); error.statusCode = 422; error.code = 'VALIDATION_ERROR'; throw error; } }
function list(req, res, next) { try { res.json(workflows.listWorkflows(req.user.id, req.query)); } catch (error) { next(error); } }
function dashboard(req, res, next) { try { res.json(workflows.dashboard(req.user.id)); } catch (error) { next(error); } }
function create(req, res, next) { try { check(req); res.status(201).json({ workflow: workflows.createWorkflow(req.user.id, req.body) }); } catch (error) { next(error); } }
function get(req, res, next) { try { res.json({ workflow: workflows.getWorkflow(req.user.id, req.params.id) }); } catch (error) { next(error); } }
function update(req, res, next) { try { check(req); res.json({ workflow: workflows.updateWorkflow(req.user.id, req.params.id, req.body) }); } catch (error) { next(error); } }
function duplicate(req, res, next) { try { res.status(201).json({ workflow: workflows.duplicateWorkflow(req.user.id, req.params.id) }); } catch (error) { next(error); } }
function remove(req, res, next) { try { workflows.deleteWorkflow(req.user.id, req.params.id); res.status(204).end(); } catch (error) { next(error); } }
async function generate(req, res, next) { try { check(req); res.json(await generateWorkflow(req.body.prompt)); } catch (error) { next(error); } }
function execute(req, res, next) { try { res.status(202).json({ execution: executions.create(req.user.id, req.params.id, req.body.input || {}) }); } catch (error) { next(error); } }
module.exports = { list, dashboard, create, get, update, duplicate, remove, generate, execute };
