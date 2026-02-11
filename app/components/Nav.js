'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Nav({ user }) {
  const router = useRouter();
  const isLoggedIn = !!user;

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">Secure App</Link>
      <div className="nav-links">
        {isLoggedIn ? (
          <>
            <Link href="/dashboard">Dashboard</Link>
            {user.role === 'admin' && <Link href="/admin">Admin</Link>}
            <button type="button" onClick={handleLogout} className="btn btn-ghost">Log out</button>
          </>
        ) : (
          <>
            <Link href="/login">Log in</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
