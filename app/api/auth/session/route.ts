import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';

export async function GET() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return NextResponse.json({ user: null });
  try {
    const user = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch {
    return NextResponse.json({ user: null });
  }
}
