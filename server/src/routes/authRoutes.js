const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
const credentials = [body('email').isEmail().normalizeEmail(), body('password').isString().isLength({ min: 8, max: 128 })];

router.post('/register', authLimiter, body('name').trim().isLength({ min: 2, max: 100 }), ...credentials, controller.register);
router.post('/login', authLimiter, ...credentials, controller.login);
router.get('/me', requireAuth, controller.me);

module.exports = router;
