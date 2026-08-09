const bcrypt = require('bcryptjs');

const users = [];

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

async function createUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  if (users.some((user) => user.email === normalizedEmail)) {
    const error = new Error('An account with that email already exists.');
    error.statusCode = 409;
    throw error;
  }
  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12),
    role: 'operator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: null
  };
  users.push(user);
  return publicUser(user);
}

async function authenticate({ email, password }) {
  const user = users.find((item) => item.email === email.trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }
  user.lastLoginAt = new Date().toISOString();
  user.updatedAt = user.lastLoginAt;
  return publicUser(user);
}

function getUserById(id) {
  const user = users.find((item) => item.id === id);
  return user ? publicUser(user) : null;
}

module.exports = { createUser, authenticate, getUserById };
