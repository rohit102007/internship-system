import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';
export async function GET() {
  const token = (await cookies()).get('auth_token')?.value;
  try {
    const user = jwt.verify(token!, JWT_SECRET) as { id: string; role: string };
    if (user.role !== 'FACULTY') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const faculty = await prisma.facultyProfile.findUnique({ where: { userId: user.id } });
    if (!faculty) return NextResponse.json({ error: 'Faculty profile not found' }, { status: 404 });
    const [internships, applications, interviews, evaluations] = await Promise.all([
      prisma.internship.count({ where: { facultyId: faculty.id } }),
      prisma.application.findMany({ where: { internship: { facultyId: faculty.id } }, select: { status: true } }),
      prisma.interview.findMany({ where: { application: { internship: { facultyId: faculty.id } } }, select: { status: true } }),
      prisma.evaluation.aggregate({ where: { internship: { facultyId: faculty.id } }, _count: true, _avg: { scoring: true } })
    ]);
    return NextResponse.json({ postings: internships, applications: { total: applications.length, pending: applications.filter(a => a.status === 'pending').length, shortlisted: applications.filter(a => a.status === 'shortlisted').length, accepted: applications.filter(a => a.status === 'accepted').length }, interviews: { scheduled: interviews.filter(i => i.status === 'SCHEDULED').length, completed: interviews.filter(i => i.status === 'COMPLETED').length }, evaluations: { count: evaluations._count, averageScore: evaluations._avg.scoring ?? 0 } });
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 403 }); }
}
