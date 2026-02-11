# Secure Web Application - Project Overview

## 📋 Project Description

A **secure authentication web application** built with **Next.js 14** (App Router) that demonstrates user registration, login, role-based access control (RBAC), and protected routes. The app uses **MySQL** for data storage, **bcrypt** for password hashing, and **iron-session** for secure session management.

---

## 🎯 Core Features

### ✅ Authentication System
- **User Registration**: Email + password with confirmation
- **User Login**: Email + password authentication
- **Session Management**: Secure encrypted cookies using `iron-session`
- **Logout**: Session destruction and redirect

### ✅ Role-Based Access Control (RBAC)
- **Two Roles**: `user` (default) and `admin`
- **Protected Routes**: 
  - `/dashboard` - Requires authentication (any logged-in user)
  - `/admin` - Requires admin role only
- **Automatic Redirects**: Non-authenticated users → `/login`, non-admins → `/dashboard`

### ✅ Security Features
- **Password Hashing**: bcrypt with 12 rounds
- **Input Validation**: Zod schemas for email/password validation
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Protection**: HTML escaping for user-generated content
- **Password Strength Meter**: Visual feedback during registration
- **Strong Password Rules**: 8+ chars, uppercase, lowercase, number, special character

### ✅ User Interface
- **Responsive Design**: Modern, clean UI with CSS variables
- **Password Visibility Toggle**: Show/hide password fields
- **Error Handling**: Field-level and general error messages
- **Loading States**: Disabled buttons during API calls
- **Navigation Bar**: Context-aware links based on auth state

---

## 🏗️ Project Structure

```
secure_web_app/
├── app/                          # Next.js App Router pages
│   ├── page.js                   # Home page (landing)
│   ├── layout.js                 # Root layout
│   ├── globals.css               # Global styles
│   ├── login/
│   │   └── page.js               # Login page (client component)
│   ├── register/
│   │   └── page.js               # Registration page (client component)
│   ├── dashboard/
│   │   ├── layout.js             # Dashboard layout (auth check)
│   │   └── page.js               # User dashboard (shows email/role)
│   ├── admin/
│   │   ├── layout.js             # Admin layout (role check)
│   │   └── page.js               # Admin panel (user list table)
│   ├── api/                      # API routes
│   │   ├── login/route.js        # POST /api/login
│   │   ├── register/route.js     # POST /api/register
│   │   ├── logout/route.js       # POST /api/logout
│   │   └── me/route.js           # GET /api/me (session info)
│   └── components/
│       ├── Nav.js                 # Navigation bar component
│       ├── PasswordStrengthMeter.js  # Password strength indicator
│       └── EyeToggle.js           # Password visibility toggle
├── lib/                          # Utility libraries
│   ├── auth.js                   # Session, bcrypt, user CRUD
│   ├── db.js                     # MySQL connection pool & queries
│   └── validation.js             # Zod schemas & HTML escaping
├── database/
│   ├── schema.sql                 # MySQL table creation script
│   └── seed-admin.js              # Script to create admin user
├── middleware.js                  # Route protection middleware
├── package.json                   # Dependencies & scripts
├── .env.example                   # Environment variables template
└── README.md                      # Setup instructions
```

---

## 🔧 Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 14.2.18 | React framework with App Router |
| **Runtime** | Node.js 18.x/20.x | JavaScript runtime |
| **Database** | MySQL (XAMPP) | User data storage |
| **ORM/Driver** | mysql2 3.11.x | MySQL connection & queries |
| **Authentication** | iron-session 8.0.x | Encrypted session cookies |
| **Password Hashing** | bcryptjs 2.4.x | Secure password storage |
| **Validation** | zod 3.23.x | Schema validation |
| **UI** | React 18.3.x | Component library |

---

## 🔐 Security Implementation

### Password Security
- **Hashing**: bcrypt with cost factor 12 (slow, secure)
- **Storage**: Only hashes stored in database, never plaintext
- **Validation**: Strong password rules enforced via Zod

### Session Security
- **Encryption**: Sessions encrypted with `SESSION_SECRET`
- **HttpOnly Cookies**: Prevents JavaScript access
- **Secure Flag**: Enabled in production (HTTPS only)
- **SameSite**: `lax` prevents CSRF attacks
- **Expiration**: 7 days max age

### SQL Injection Prevention
- **Parameterized Queries**: All database queries use `?` placeholders
- **No String Concatenation**: SQL built with placeholders only
- **Example**: `query('SELECT * FROM users WHERE email = ?', [email])`

### XSS Prevention
- **HTML Escaping**: `escapeHtml()` function converts `<`, `>`, `&`, etc.
- **Server-Side Rendering**: User content escaped before rendering
- **Example**: `{escapeHtml(user.email)}` in JSX

### Route Protection
- **Middleware**: Checks for session cookie before allowing access
- **Layout Guards**: Admin layout checks `role === 'admin'`
- **Redirects**: Unauthorized users redirected appropriately

---

## 📊 Database Schema

### `users` Table
```sql
- id (INT, PRIMARY KEY, AUTO_INCREMENT)
- email (VARCHAR(255), UNIQUE, NOT NULL)
- password_hash (VARCHAR(255), NOT NULL)
- role (ENUM('user', 'admin'), DEFAULT 'user')
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

**Indexes**: `email`, `role` (for fast lookups)

---

## 🔄 User Flows

### Registration Flow
1. User visits `/register`
2. Enters email, password, confirm password
3. Client validates password strength (visual meter)
4. Form submits to `/api/register`
5. Server validates with Zod schema
6. Checks for duplicate email
7. Hashes password with bcrypt
8. Creates user in database (role = 'user')
9. Creates session cookie
10. Redirects to `/dashboard`

### Login Flow
1. User visits `/login` (or redirected from protected route)
2. Enters email and password
3. Form submits to `/api/login`
4. Server validates input with Zod
5. Looks up user by email
6. Compares password hash with bcrypt
7. Creates session cookie (stores userId, email, role)
8. Redirects to `/dashboard` (or original destination)

### Dashboard Access Flow
1. User navigates to `/dashboard`
2. Middleware checks for session cookie
3. If no session → redirect to `/login?from=/dashboard`
4. If session exists → render dashboard page
5. Dashboard layout reads session, displays user info

### Admin Access Flow
1. Admin navigates to `/admin`
2. Middleware checks for session cookie
3. Admin layout checks `session.role === 'admin'`
4. If not admin → redirect to `/dashboard`
5. If admin → render admin panel with user list

---

## 🎨 Key Components

### `Nav.js`
- **Purpose**: Navigation bar with auth-aware links
- **Props**: `user` (object with `email`, `role` or `null`)
- **Features**: 
  - Shows "Log in" / "Register" when logged out
  - Shows "Dashboard" / "Admin" / "Log out" when logged in
  - Admin link only visible to admins

### `PasswordStrengthMeter.js`
- **Purpose**: Visual feedback for password strength
- **Levels**: Weak, Fair, Good, Strong
- **Checks**: Length, uppercase, lowercase, number, special char

### `EyeToggle.js`
- **Purpose**: Toggle password visibility
- **Props**: `visible` (boolean), `onClick` (function)

---

## 🛠️ API Endpoints

### `POST /api/login`
- **Body**: `{ email, password }`
- **Success**: `{ success: true, role: 'user'|'admin' }`
- **Errors**: `400` (validation), `401` (invalid credentials), `500` (server error)

### `POST /api/register`
- **Body**: `{ email, password, confirmPassword }`
- **Success**: `{ success: true, role: 'user' }`
- **Errors**: `400` (validation), `409` (email exists), `500` (server error)

### `POST /api/logout`
- **Body**: None
- **Success**: Destroys session cookie
- **Response**: `{ success: true }`

### `GET /api/me`
- **Purpose**: Get current session info
- **Success**: `{ userId, email, role }` or `null` if not logged in

---

## 📝 Environment Variables

Required in `.env` file:
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=secure_web_app
SESSION_SECRET=your-random-secret-at-least-32-characters-long
```

**⚠️ Important**: Never commit `.env` to git (use `.env.example` instead)

---

## 🚀 Getting Started

1. **Install dependencies**: `npm install`
2. **Set up MySQL**: Create database, run `database/schema.sql`
3. **Configure environment**: Copy `.env.example` to `.env`, set values
4. **Create admin user**: Run `node database/seed-admin.js` (optional)
5. **Start dev server**: `npm run dev`
6. **Open browser**: `http://localhost:3000`

---

## 📈 Project Status

### ✅ Completed Features
- User registration with validation
- User login with session creation
- Password hashing and verification
- Role-based access control
- Protected routes (middleware + layouts)
- Admin panel (user list)
- Password strength meter
- XSS and SQL injection protection
- Responsive UI components

### 🔄 Potential Enhancements
- Password reset functionality
- Email verification
- Two-factor authentication (2FA)
- User profile editing
- Activity logging
- Rate limiting for API endpoints
- CSRF token protection
- Remember me functionality

---

## 📚 Learning Outcomes

This project demonstrates:
- **Next.js App Router** patterns (server components, API routes, layouts)
- **Authentication** best practices (sessions, password hashing)
- **Security** fundamentals (SQL injection, XSS prevention)
- **Role-based access control** implementation
- **Database** integration with MySQL
- **Form validation** with Zod
- **Client-server** communication patterns

---

## 📄 License

Private project - educational/demo purposes.
