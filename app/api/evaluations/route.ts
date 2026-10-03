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
    if (!user || user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, internshipId, criteria, scoring, feedback } = body;
    const score = Number(scoring);
    if (!studentId || !internshipId || !criteria || !Number.isFinite(score) || score < 1 || score > 5) {
      return NextResponse.json({ error: 'Student, internship, criteria, and a score from 1 to 5 are required' }, { status: 400 });
    }
    const profile = await prisma.facultyProfile.findUnique({ where: { userId: user.id } });
    const internship = await prisma.internship.findFirst({ where: { id: internshipId, facultyId: profile?.id } });
    if (!internship) return NextResponse.json({ error: 'Internship not found' }, { status: 404 });

    const evaluation = await prisma.evaluation.create({
      data: { studentId, internshipId, criteria, scoring: score, feedback }
    });
    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role === 'STUDENT') {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      const evals = await prisma.evaluation.findMany({ where: { studentId: profile?.id }, include: { internship: true } });
      return NextResponse.json(evals);
    } else if (user.role === 'FACULTY') {
      const profile = await prisma.facultyProfile.findUnique({ where: { userId: user.id } });
      const evals = await prisma.evaluation.findMany({ where: { internship: { facultyId: profile?.id } }, include: { student: { include: { user: true } }, internship: true } });
      return NextResponse.json(evals);
    }
    return NextResponse.json({ error: 'Role not supported' }, { status: 403 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
