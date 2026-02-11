import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import Nav from '@/app/components/Nav';

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore);
  const user = session?.userId ? { email: session.email, role: session.role } : null;
  if (!user) return null; // middleware already redirects
  return (
    <>
      <Nav user={user} />
      <div style={{ paddingTop: '56px', minHeight: '100vh' }}>{children}</div>
    </>
  );
}
