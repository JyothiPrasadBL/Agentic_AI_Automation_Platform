const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

function issueToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, jwtSecret, { expiresIn: '7d' });
}

module.exports = { issueToken };
