import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';
async function faculty() { const token = (await cookies()).get('auth_token')?.value; try { const user = jwt.verify(token!, JWT_SECRET) as { id: string; role: string }; return user.role === 'FACULTY' ? user : null; } catch { return null; } }
async function ownedInterview(id: string, userId: string) { const profile = await prisma.facultyProfile.findUnique({ where: { userId } }); return prisma.interview.findFirst({ where: { id, application: { internship: { facultyId: profile?.id } } } }); }
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await faculty(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  const id = (await context.params).id; if (!await ownedInterview(id, user.id)) return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
  const { date, time, interviewerDetails, results, feedback, status } = await request.json();
  if (status && !['SCHEDULED', 'COMPLETED', 'CANCELLED'].includes(status)) return NextResponse.json({ error: 'Invalid interview status' }, { status: 400 });
  if (date || time) { const scheduled = new Date(`${date ?? new Date().toISOString().slice(0, 10)}T${time ?? '00:00'}`); if (Number.isNaN(scheduled.getTime()) || (status !== 'COMPLETED' && scheduled.getTime() - Date.now() < 86400000)) return NextResponse.json({ error: 'Rescheduled interviews require at least 24 hours notice' }, { status: 400 }); }
  return NextResponse.json(await prisma.interview.update({ where: { id }, data: { date: date ? new Date(date) : undefined, time, interviewerDetails, results, feedback, status } }));
}
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) { const user = await faculty(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 }); const id = (await context.params).id; if (!await ownedInterview(id, user.id)) return NextResponse.json({ error: 'Interview not found' }, { status: 404 }); await prisma.interview.update({ where: { id }, data: { status: 'CANCELLED' } }); return NextResponse.json({ message: 'Interview cancelled' }); }
