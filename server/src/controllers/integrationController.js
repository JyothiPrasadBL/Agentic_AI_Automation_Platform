const integrations = require('../services/integrationService');
const { clientUrl } = require('../config/env');
function list(req, res, next) { try { res.json({ integrations: integrations.list(req.user.id) }); } catch (error) { next(error); } }
function status(req, res, next) { try { res.json(integrations.status(req.user.id)); } catch (error) { next(error); } }
function start(req, res, next) { try { res.json({ authorizationUrl: integrations.start(req.user.id, req.params.provider) }); } catch (error) { next(error); } }
async function callback(req, res, next) { try { if (req.query.error) throw new Error(`OAuth provider returned: ${req.query.error}`); await integrations.complete(req.params.provider, req.query.code, req.query.state); res.redirect(`${clientUrl}/integrations?connected=${encodeURIComponent(req.params.provider)}`); } catch (error) { next(error); } }
function createOrUpdate(req, res, next) { try { const integration = integrations.upsert(req.user.id, req.body.provider, req.body); res.status(201).json({ integration }); } catch (error) { next(error); } }
async function test(req, res, next) { try { res.json(await integrations.test(req.user.id, req.params.provider)); } catch (error) { next(error); } }
module.exports = { list, status, start, callback, createOrUpdate, test };
