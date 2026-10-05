import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PASSWORD_PATTERN } from '@/lib/validation';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!PASSWORD_PATTERN.test(password || '')) return NextResponse.json({ error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' }, { status: 400 });
    const data = jwt.verify(token, JWT_SECRET) as { id: string; purpose: string };
    if (data.purpose !== 'password-reset') return NextResponse.json({ error: 'Invalid reset link' }, { status: 400 });
    await prisma.user.update({ where: { id: data.id }, data: { password: await bcrypt.hash(password, 10) } });
    return NextResponse.json({ message: 'Password reset successfully' });
  } catch { return NextResponse.json({ error: 'This password-reset link is invalid or has expired.' }, { status: 400 }); }
}
