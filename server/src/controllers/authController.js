const { validationResult } = require('express-validator');
const { createUser, authenticate } = require('../services/userService');
const { issueToken } = require('../services/authService');

function validate(req) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.code = 'VALIDATION_ERROR';
    error.details = result.array();
    throw error;
  }
}

async function register(req, res, next) {
  try {
    validate(req);
    const user = await createUser(req.body);
    res.status(201).json({ user, token: issueToken(user) });
  } catch (error) { next(error); }
}

async function login(req, res, next) {
  try {
    validate(req);
    const user = await authenticate(req.body);
    res.json({ user, token: issueToken(user) });
  } catch (error) { next(error); }
}

function me(req, res) { res.json({ user: req.user }); }

module.exports = { register, login, me };
