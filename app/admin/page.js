import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { escapeHtml } from '@/lib/validation';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore);
  if (!session?.userId || session.role !== 'admin') return null;
  const users = await query('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 50');

  return (
    <div className="page" style={{ justifyContent: 'flex-start', paddingTop: '5rem' }}>
      <div className="container" style={{ maxWidth: '720px' }}>
        <h1 className="card-title" style={{ marginBottom: '0.25rem' }}>Admin panel</h1>
        <p className="card-description">
          Role-based access: only admins can view this page. Direct URL access is blocked for non-admins.
        </p>
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Users</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{escapeHtml(u.email)}</td>
                    <td>{escapeHtml(u.role)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
