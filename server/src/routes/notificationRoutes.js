const router = require('express').Router();
const controller = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');
router.use(requireAuth); router.get('/', controller.list); router.post('/:id/read', controller.markRead);
module.exports = router;
