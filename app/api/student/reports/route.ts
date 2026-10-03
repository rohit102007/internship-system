import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';
export async function GET() {
  const token = (await cookies()).get('auth_token')?.value;
  try {
    const user = jwt.verify(token!, JWT_SECRET) as { id: string; role: string };
    if (user.role !== 'STUDENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    const [applications, interviews] = await Promise.all([
      prisma.application.findMany({ where: { studentId: profile.id }, include: { internship: { include: { company: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.interview.findMany({ where: { application: { studentId: profile.id } }, include: { application: { include: { internship: true } } }, orderBy: { date: 'asc' } })
    ]);
    const now = new Date();
    return NextResponse.json({ applications: { total: applications.length, pending: applications.filter(a => a.status === 'pending').length, shortlisted: applications.filter(a => a.status === 'shortlisted').length, accepted: applications.filter(a => a.status === 'accepted').length, rejected: applications.filter(a => a.status === 'rejected').length, withdrawn: applications.filter(a => a.status === 'withdrawn').length, timeline: applications.map(a => ({ id: a.id, status: a.status, createdAt: a.createdAt, updatedAt: a.updatedAt, internship: a.internship.title, company: a.internship.company.name })) }, interviews: { upcoming: interviews.filter(i => i.date >= now && i.status === 'SCHEDULED'), past: interviews.filter(i => i.date < now || i.status !== 'SCHEDULED') }, placement: applications.filter(a => a.status === 'accepted').map(a => ({ internship: a.internship.title, company: a.internship.company.name, stipend: a.internship.stipend, startDate: a.internship.startDate })) });
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 403 }); }
}
