import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import Nav from '@/app/components/Nav';

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore);
  const user = session?.userId ? { email: session.email, role: session.role } : null;

  return (
    <div className="page">
      <Nav user={user} />
      <main style={{ marginTop: '88px', textAlign: 'center', padding: '3rem 2rem' }}>
        <h1 className="hero-title">Secure Web Application</h1>
        <p className="hero-subtitle">
          Sign in or create an account. Role-based access and protected routes powered by MySQL.
        </p>
        {!user && (
          <>
            <div className="hero-badges">
              <span className="hero-badge">Login &amp; Register</span>
              <span className="hero-badge">Role-based access</span>
              <span className="hero-badge">Protected routes</span>
            </div>
            <div className="cta-group">
              <Link href="/login" className="btn btn-primary">Log in</Link>
              <Link href="/register" className="btn btn-ghost">Create account</Link>
            </div>
          </>
        )}
        {user && (
          <p className="user-greeting">
            Signed in as <strong>{user.email}</strong> ({user.role})
          </p>
        )}
      </main>
    </div>
  );
}
