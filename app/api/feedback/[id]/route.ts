import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get('auth_token')?.value;
  try {
    const user = jwt.verify(token!, JWT_SECRET) as { role: string };
    if (user.role !== 'FACULTY') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { response } = await request.json();
    if (!response?.trim()) return NextResponse.json({ error: 'A response is required' }, { status: 400 });
    const id = (await context.params).id;
    const existing = await prisma.feedback.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    const feedback = await prisma.feedback.update({ where: { id }, data: { comments: `${existing.comments}\n\nFaculty response: ${response}` } });
    return NextResponse.json(feedback);
  } catch { return NextResponse.json({ error: 'Unable to respond to feedback' }, { status: 500 }); }
}
