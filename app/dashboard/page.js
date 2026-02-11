import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { escapeHtml } from '@/lib/validation';
import Link from 'next/link';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore);
  if (!session?.userId) return null;
  const safeEmail = escapeHtml(session.email);

  return (
    <div className="page" style={{ justifyContent: 'flex-start', paddingTop: '5rem' }}>
      <div className="container" style={{ maxWidth: '560px' }}>
        <h1 className="card-title" style={{ marginBottom: '0.25rem' }}>Dashboard</h1>
        <p className="card-description">
          Protected page. Only logged-in users can see this.
        </p>
        <div className="card">
          <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {safeEmail}</p>
          <p style={{ marginBottom: '1rem' }}><strong>Role:</strong> {escapeHtml(session.role)}</p>
          {session.role === 'admin' && (
            <Link href="/admin" className="btn btn-primary">Admin panel</Link>
          )}
        </div>
      </div>
    </div>
  );
}
