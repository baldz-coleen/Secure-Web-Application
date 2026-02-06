What features are already working

Working features:
- User registration with email, password, confirm password, and a password strength meter.
- Login page that sends a request to /api/login, handles errors, and redirects on success.
- Password security using bcrypt hashing and secure session cookies with iron-session.
- Role-based access with user and admin roles stored in the database.
- Protected routes:
/dashboard requires a logged‑in user.
/admin requires the user to be an admin (non‑admins are redirected to /dashboard).
-Database setup with a users table, parameterized queries, and a script to seed an admin.
-Basic security: input validation with Zod, SQL injection protection (prepared statements), and XSS protection with HTML escaping.
