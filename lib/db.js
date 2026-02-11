const mysql = require('mysql2/promise');

let pool = null;

function getPool() {
  if (!pool) {
    const config = {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '3306', 10),
      user: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'secure_web_app',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };
    pool = mysql.createPool(config);
  }
  return pool;
}

/**
 * Execute a parameterized query (prevents SQL injection).
 * @param {string} sql - SQL with ? placeholders
 * @param {Array} params - Values for placeholders
 */
async function query(sql, params = []) {
  const p = getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}

module.exports = { getPool, query };
