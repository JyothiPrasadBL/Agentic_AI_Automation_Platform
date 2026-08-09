const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const { getUserById } = require('../services/userService');

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Authentication is required.' });
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = getUserById(payload.sub);
    if (!user) return res.status(401).json({ error: 'INVALID_SESSION', message: 'Your session is no longer valid.' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Your session token is invalid or expired.' });
  }
}

module.exports = { requireAuth };
