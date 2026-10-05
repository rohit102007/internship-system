import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const user = typeof email === 'string' ? await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } }) : null;
    const response: { message: string; resetToken?: string } = { message: 'If an account exists for that email, a password reset can be started.' };
    if (user) {
      const token = jwt.sign({ id: user.id, purpose: 'password-reset' }, JWT_SECRET, { expiresIn: '15m' });
      response.resetToken = token;
    }
    return NextResponse.json(response);
  } catch { return NextResponse.json({ error: 'Unable to start password reset' }, { status: 500 }); }
}
