# Demo Guide – Where Security Happens in the Code

Use this to explain and show during the demo. All references are to the actual codebase.

---

## 1. Where password hashing happens

**Hashing (plain password → hash before storing):**

- **File:** `lib/auth.js`  
  - **Lines 20–22:** `hashPassword(plainPassword)` uses **bcrypt** with **12 rounds** (cost factor).  
  - **Line 21:** `return bcrypt.hash(plainPassword, 12);`

- **File:** `app/api/register/route.js`  
  - **Lines 23–24:** On registration we **never store the plain password**. We call `hashPassword(password)` and store only the hash:
    ```js
    const passwordHash = await hashPassword(password);
    const userId = await createUser(normalizedEmail, passwordHash, 'user');
    ```
  - **File:** `lib/auth.js` **lines 33–37:** `createUser` saves `password_hash` in the database via a parameterized INSERT (no plain password in DB).

**Verification (checking login password):**

- **File:** `lib/auth.js`  
  - **Lines 24–26:** `verifyPassword(plainPassword, hash)` uses `bcrypt.compare()` so we never compare plain text to plain text.

- **File:** `app/api/login/route.js`  
  - **Lines 23–26:** We compare the submitted password to the stored hash:
    ```js
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) { ... 401 ... }
    ```

**Summary:** Hashing happens in `lib/auth.js` (`hashPassword`). It is used in `app/api/register/route.js` when creating a user. Login uses `lib/auth.js` `verifyPassword` in `app/api/login/route.js`.

---

## 2. How roles are checked

**Where the role is stored:**

- After login or register, the **role** is put in the **session** (encrypted cookie):
  - **Register:** `app/api/register/route.js` lines 28–30: `session.role = 'user'`
  - **Login:** `app/api/login/route.js` lines 29–31: `session.role = user.role` (from DB)

**Where the role is checked (admin-only):**

- **File:** `app/admin/layout.js`  
  - **Lines 7–10:** Before rendering any admin page we:
    1. Get the session.
    2. If no user, redirect to `/login`.
    3. If `session.role !== 'admin'`, redirect to `/dashboard`.
    ```js
    const session = await getSession(cookieStore);
    if (!session?.userId) redirect('/login');
    if (session.role !== 'admin') redirect('/dashboard');
    ```
  So even if someone hits `/admin` directly, **non-admins are redirected**; only `role === 'admin'` can see admin pages.

**Where the role is used in the UI:**

- **File:** `app/components/Nav.js`  
  - Admin link is shown only when `user.role === 'admin'`.
- **File:** `app/dashboard/page.js`  
  - “Admin panel” link is shown only when `session.role === 'admin'`.

**Summary:** Role is stored in session; the **definitive** role check for admin access is in `app/admin/layout.js` (session.role === 'admin').

---

## 3. How routes are protected

**Step 1 – Middleware (all protected paths):**

- **File:** `middleware.js`  
  - **Lines 5–16:** Runs on every request to `/dashboard/*`, `/admin/*`, `/login`, `/register` (see `config.matcher`).
  - **Logic:**
    - If the path is **protected** (`/dashboard` or `/admin`) and the request **does not** have the session cookie (`secure_app_session`), we **redirect to `/login`** (and optionally pass `?from=...`).
    - If the path is **login/register** and the user **has** a session, we **redirect to `/dashboard`** so logged-in users cannot open login/register again.
  - **Line 7:** `const hasSession = request.cookies.has(SESSION_COOKIE);`
  - **Lines 12–15:** `if (isProtected && !hasSession) { return NextResponse.redirect(loginUrl); }`

So: **no session cookie ⇒ no access to `/dashboard` or `/admin`**; they are sent to login.

**Step 2 – Admin layout (role check):**

- **File:** `app/admin/layout.js`  
  - Even if middleware let the request through (e.g. they have a session), we **check role** here. If not admin, redirect to `/dashboard`. So **route protection** = middleware (session) + admin layout (role).

**Summary:**  
- **Protected routes** = middleware in `middleware.js`: no cookie ⇒ redirect to login.  
- **Admin-only** = `app/admin/layout.js`: role !== 'admin' ⇒ redirect to dashboard.

---

## 4. How input is validated

**Server-side validation (Zod):**

- **File:** `lib/validation.js`  
  - **Register:** `registerSchema` (lines 30–37): email (format, max length), password (length, lowercase, uppercase, number, special char), confirmPassword, and “passwords must match”.
  - **Login:** `loginSchema` (lines 39–42): email and password required/max length.
  - **Functions:** `validateRegister(body)` and `validateLogin(body)` return `schema.safeParse(body)` (no exception; we check `parsed.success`).

**Where validation is used:**

- **File:** `app/api/register/route.js`  
  - **Lines 8–15:** We validate the request body **before** any DB or hashing:
    ```js
    const parsed = validateRegister(body);
    if (!parsed.success) {
      return NextResponse.json({ error: '...', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    ```
  - We use only `parsed.data` (email, password) afterward, so invalid input never reaches hashing or DB.

- **File:** `app/api/login/route.js`  
  - **Lines 8–15:** Same pattern with `validateLogin(body)`; invalid input gets 400 and never hits the database.

**SQL injection prevention:**

- **File:** `lib/db.js`  
  - **Lines 27–30:** All queries use **parameterized** calls: `p.execute(sql, params)`. User input is passed only as **parameters** (e.g. `[email]`), never concatenated into SQL.  
- **Example:** `lib/auth.js` line 29: `query('... WHERE email = ? LIMIT 1', [email])`.

**XSS prevention:**

- **File:** `lib/validation.js`  
  - **Lines 4–13:** `escapeHtml(str)` escapes `& < > " '` before output.
- **Usage:** Any user-supplied text rendered in the UI (e.g. email on dashboard/admin) should be passed through `escapeHtml()` (e.g. in `app/dashboard/page.js`, `app/admin/page.js`).

**Summary:**  
- **Input validation** = Zod in `lib/validation.js`; used in `app/api/register/route.js` and `app/api/login/route.js` before any business logic.  
- **SQL injection** = parameterized queries only in `lib/db.js`.  
- **XSS** = `escapeHtml()` from `lib/validation.js` when rendering user content.

---

## Quick reference

| Requirement           | Where it happens |
|-----------------------|------------------|
| Password hashing      | `lib/auth.js` (`hashPassword`); used in `app/api/register/route.js` |
| Password verification | `lib/auth.js` (`verifyPassword`); used in `app/api/login/route.js` |
| Role check (admin)    | `app/admin/layout.js` (`session.role !== 'admin'` → redirect) |
| Route protection      | `middleware.js` (session cookie check; redirect to login) |
| Input validation      | `lib/validation.js` (Zod); used in register + login API routes |
| SQL safety            | `lib/db.js` (parameterized `execute`) |
| XSS safety            | `lib/validation.js` (`escapeHtml`); use when rendering user data |

You can open these files at the given lines during the demo to show you understand the code and it is not blind copy-paste.
