import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Nav from '@/app/components/Nav';

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const session = await getSession(cookieStore);
  if (!session?.userId) redirect('/login');
  if (session.role !== 'admin') redirect('/dashboard');
  const user = { email: session.email, role: session.role };
  return (
    <>
      <Nav user={user} />
      <div style={{ paddingTop: '56px', minHeight: '100vh' }}>{children}</div>
    </>
  );
}
