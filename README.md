# Secure Web Application

Next.js app with **Login**, **Registration**, **Role-Based Access (Admin/User)**, **Protected Routes**, **Input Validation**, and **Password Strength Meter**. Uses **XAMPP MySQL** and **bcrypt** for password hashing.

---

## Framework & versions

| Dependency   | Version  |
|-------------|----------|
| **Framework** | Next.js **14.2.18** (App Router) |
| Node.js     | 18.x or 20.x (LTS recommended) |
| React       | 18.3.x  |
| MySQL       | XAMPP MySQL (e.g. 5.7 / 8.0) |
| bcryptjs    | 2.4.x   |
| iron-session| 8.0.x   |
| mysql2      | 3.11.x  |
| zod         | 3.23.x  |

---

## How to run the project (setup steps)

### 1. Prerequisites

- **Node.js** (v18 or v20 LTS)
- **XAMPP** with **MySQL** running (or any MySQL server)
- Terminal (PowerShell, CMD, or bash)

### 2. Clone / open the project

```bash
cd c:\Users\Che\secure_web_app
```

### 3. Install dependencies

```bash
npm install
```

### 4. Database setup

1. Start **XAMPP** → start **MySQL**.
2. Open **phpMyAdmin** (e.g. http://localhost/phpmyadmin).
3. Create a database named **`secure_web_app`** (if it does not exist).
4. Select that database → **SQL** tab → paste and run the contents of **`database/schema.sql`** to create the `users` table.

### 5. Environment variables

1. Copy the example env file:
   ```bash
   copy .env.example .env
   ```
2. Edit **`.env`** and set:
   - `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` for your MySQL (XAMPP default: host=localhost, port=3306, user=root, password=blank).
   - `SESSION_SECRET` — use a long random string (e.g. 32+ characters). Example: run `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` and paste the output.

### 6. Create test accounts (see next section)

Use the **Admin & User test accounts** section below to create an admin and a normal user for testing.

### 7. Run the app

```bash
npm run dev
```

8. Open in browser: **http://localhost:3000**

---

## Admin & User test accounts

You need at least one **user** and one **admin** to demo login, dashboard, and admin panel.

### Option A – Register in the app, then promote to admin

1. Run the app and go to **http://localhost:3000**.
2. Click **Register** and create a user, e.g.:
   - **Email:** `user@test.com`
   - **Password:** e.g. `UserPass123!` (must match validation: 8+ chars, upper, lower, number, symbol).
3. In **phpMyAdmin**, select database **`secure_web_app`**, run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'user@test.com';
   ```
4. Log out (or use another browser/incognito), then log in again as `user@test.com` — you will have admin access (Admin link and `/admin` will work).

### Option B – Seed script for admin (optional)

From the project root, with `.env` set and MySQL running:

```bash
set ADMIN_EMAIL=admin@test.com
set ADMIN_PASSWORD=Admin123!
node database/seed-admin.js
```

Then use **admin@test.com** / **Admin123!** to log in as admin. Create a second account via the app for a **user** (e.g. **user@test.com** / **UserPass123!**).

### Suggested demo accounts

| Role  | Email           | Password     | Purpose |
|-------|-----------------|--------------|---------|
| User  | `user@test.com` | `UserPass123!` | Login, dashboard, no admin access |
| Admin | `admin@test.com`| `Admin123!`    | Login, dashboard, admin panel (/admin) |

Use strong, unique passwords in production; these are for **local/demo only**.

---

## Features

- **Login & Registration** – Email + password with validation
- **Password hashing** – bcrypt (cost factor 12)
- **Role-Based Access** – `admin` and `user` roles
- **Protected routes** – `/dashboard` and `/admin` require auth; `/admin` requires admin role (direct URL access blocked for non-admins)
- **Input validation** – Zod schemas; prevents invalid emails/passwords and enforces strong password rules
- **SQL injection** – All DB access uses parameterized queries (`mysql2` prepared statements)
- **XSS** – Server-side HTML escaping for user content; security headers (X-Content-Type-Options, X-XSS-Protection, etc.)
- **Password strength meter** – Shown on registration (Weak / Fair / Good / Strong)

## Setup

### 1. Database (XAMPP MySQL)

1. Start **XAMPP** and run **MySQL**.
2. Create a database (e.g. in phpMyAdmin):
   - Create database: `secure_web_app`
3. Run the schema to create the `users` table:
   - In phpMyAdmin, select `secure_web_app`, go to **SQL**, and run the contents of `database/schema.sql`.

### 2. Create an admin user (optional)

After the first user is registered, promote one to admin in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Or insert an admin directly (password below = `Admin123!`; replace with your own and hash with bcrypt if needed):

```sql
-- Generate your own hash, e.g. in Node: require('bcryptjs').hashSync('YourPassword', 12)
INSERT INTO users (email, password_hash, role) VALUES ('admin@example.com', '$2a$12$...', 'admin');
```

### 3. Environment variables

Copy `.env.example` to `.env` and set your values:

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=secure_web_app
SESSION_SECRET=your-session-secret-at-least-32-chars-long
```

Generate a strong `SESSION_SECRET` (e.g. `openssl rand -base64 32`).

### 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register a user, then (if you set one) log in as admin and open **Admin** to see the user list.

## Project structure

- `app/` – Next.js App Router (pages, API routes, layout)
- `app/api/login`, `register`, `logout`, `me` – Auth API
- `app/components/` – Nav, PasswordStrengthMeter
- `lib/auth.js` – Session (iron-session), bcrypt, user lookup/create
- `lib/db.js` – MySQL pool and parameterized `query()`
- `lib/validation.js` – Zod schemas and `escapeHtml()` for XSS
- `middleware.js` – Protects `/dashboard` and `/admin` (redirect to `/login` if no session)
- `database/schema.sql` – MySQL table definition

## Security notes

- Passwords are hashed with **bcrypt** (12 rounds).
- Sessions are stored in **encrypted cookies** (iron-session).
- **Protected routes**: middleware checks for session cookie; admin layout checks `role === 'admin'` and redirects others to `/dashboard`.
- **Validation**: registration and login use Zod; password rules: 8+ chars, upper, lower, number, special character.
- **SQL**: only parameterized queries via `lib/db.js`.
- **XSS**: user content is escaped with `escapeHtml()` before rendering.

---

## Demo / “Where does it happen?”

For **where password hashing, role checks, route protection, and input validation** happen in the code (with file and line references), see **`DEMO.md`**. Use it to answer questions and show the code during the demo.
