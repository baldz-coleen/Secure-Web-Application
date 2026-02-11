const { getIronSession } = require('iron-session');
const bcrypt = require('bcryptjs');
const { query } = require('./db');

const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET || 'complex-secret-at-least-32-characters-long',
  cookieName: 'secure_app_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  },
};

/** Get session (pass cookies() from next/headers in App Router) */
async function getSession(cookieStore) {
  return getIronSession(cookieStore, SESSION_OPTIONS);
}

async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 12);
}

async function verifyPassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

async function findUserByEmail(email) {
  const rows = await query('SELECT id, email, password_hash, role FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function createUser(email, passwordHash, role = 'user') {
  const [result] = await require('./db').getPool().execute(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
    [email, passwordHash, role]
  );
  return result.insertId;
}

module.exports = {
  getSession,
  hashPassword,
  verifyPassword,
  findUserByEmail,
  createUser,
  SESSION_OPTIONS,
};
