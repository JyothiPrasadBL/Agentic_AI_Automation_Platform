const router = require('express').Router();
const { body } = require('express-validator');
const controller = require('../controllers/workflowController');
const { requireAuth } = require('../middleware/auth');

const workflowFields = [body('name').optional().isString().trim().isLength({ min: 1, max: 120 }), body('description').optional().isString().isLength({ max: 2000 }), body('nodes').optional().isArray({ max: 200 }), body('edges').optional().isArray({ max: 500 }), body('tags').optional().isArray({ max: 20 })];
router.use(requireAuth);
router.get('/dashboard', controller.dashboard);
router.post('/generate', body('prompt').isString().trim().isLength({ min: 3, max: 4000 }), controller.generate);
router.get('/', controller.list);
router.post('/', ...workflowFields, controller.create);
router.get('/:id', controller.get);
router.put('/:id', ...workflowFields, controller.update);
router.post('/:id/duplicate', controller.duplicate);
router.post('/:id/execute', controller.execute);
router.delete('/:id', controller.remove);
module.exports = router;
