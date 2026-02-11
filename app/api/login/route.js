import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateLogin } from '@/lib/validation';
import { verifyPassword, findUserByEmail, getSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = validateLogin(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const session = await getSession(cookieStore);
    session.userId = user.id;
    session.email = user.email;
    session.role = user.role;
    await session.save();

    return NextResponse.json({ success: true, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 });
  }
}
