import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);
    if (!session.userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
      },
    });
  } catch (err) {
    console.error('Me error:', err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
