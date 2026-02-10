/**
 * One-time script to create an admin user. Run from project root:
 * node -r dotenv/config database/seed-admin.js
 * Or set env vars and run: node database/seed-admin.js
 *
 * Install dotenv if needed: npm install dotenv
 */
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const email = process.env.ADMIN_EMAIL || 'admin@example.com';
const password = process.env.ADMIN_PASSWORD || 'Admin123!';

async function main() {
  const pool = mysql.createPool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'secure_web_app',
  });
  const hash = await bcrypt.hash(password, 12);
  await pool.execute(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password_hash = ?, role = ?',
    [email, hash, 'admin', hash, 'admin']
  );
  console.log('Admin user created/updated:', email);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
