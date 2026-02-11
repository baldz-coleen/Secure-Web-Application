import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateRegister } from '@/lib/validation';
import { hashPassword, createUser, findUserByEmail, getSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = validateRegister(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const userId = await createUser(normalizedEmail, passwordHash, 'user');

    const cookieStore = await cookies();
    const session = await getSession(cookieStore);
    session.userId = userId;
    session.email = normalizedEmail;
    session.role = 'user';
    await session.save();

    return NextResponse.json({ success: true, role: 'user' });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
  }
}
