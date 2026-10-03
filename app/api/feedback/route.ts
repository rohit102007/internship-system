import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET) as { id: string, role: string }; } catch { return null; }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { type, rating, comments } = body; // type: STUDENT_ON_COMPANY, SYSTEM, etc.
    const validTypes = ['STUDENT_ON_COMPANY', 'COMPANY_ON_STUDENT', 'FACULTY_ON_INTERNSHIP', 'SYSTEM'];
    if (!validTypes.includes(type) || !comments?.trim()) return NextResponse.json({ error: 'A valid feedback type and comments are required' }, { status: 400 });

    let studentId = null;
    if (user.role === 'STUDENT') {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      if (profile) studentId = profile.id;
    }

    if (rating !== undefined && rating !== null && (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5)) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: { studentId, type, rating: rating === undefined || rating === null ? null : Number(rating), comments }
    });
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user || !['ADMIN', 'FACULTY'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const feedbacks = await prisma.feedback.findMany({
      where: user.role === 'FACULTY' ? { type: { in: ['STUDENT_ON_COMPANY', 'FACULTY_ON_INTERNSHIP'] } } : undefined,
      include: { student: { include: { user: true } } }, orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(feedbacks);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
