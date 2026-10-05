import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.isActive === false || user.status === 'Inactive') {
      return NextResponse.json({ error: 'This account has been deactivated. Contact an administrator for assistance.' }, { status: 403 });
    }

    if (user.role === 'STUDENT') {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      if (!profile?.isActive) {
        return NextResponse.json({ error: 'This student account has been deactivated. Contact an administrator for assistance.' }, { status: 403 });
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Instead of using next/headers cookies (which is server-only rendering), 
    // we'll send it back as JSON and let the client handle it via standard HTTP header cookies if needed,
    // or just return the token for the client to store.
    const response = NextResponse.json(
      { 
        message: 'Login successful', 
        user: { id: user.id, name: user.name, role: user.role, email: user.email },
        token
      },
      { status: 200 }
    );

    // Set HttpOnly cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
