import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';
const MAX_RESUME_SIZE = 5 * 1024 * 1024;

async function getStudent() {
  const token = (await cookies()).get('auth_token')?.value;
  try {
    const user = jwt.verify(token!, JWT_SECRET) as { id: string; role: string };
    return user.role === 'STUDENT' ? user : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const user = await getStudent();
  if (!user) return NextResponse.json({ error: 'Only students can upload resumes' }, { status: 403 });

  try {
    const formData = await request.formData();
    const file = formData.get('resume');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Please choose a PDF resume' }, { status: 400 });
    if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Resume must be a PDF file' }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_RESUME_SIZE) {
      return NextResponse.json({ error: 'Resume must be no larger than 5 MB' }, { status: 400 });
    }

    const uploadsDirectory = path.join(process.cwd(), 'public', 'uploads', 'resumes');
    await mkdir(uploadsDirectory, { recursive: true });
    const fileName = `${user.id}-${randomUUID()}.pdf`;
    await writeFile(path.join(uploadsDirectory, fileName), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ resumeUrl: `/uploads/resumes/${fileName}` }, { status: 201 });
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json({ error: 'Unable to upload resume' }, { status: 500 });
  }
}

export async function DELETE() {
  const user = await getStudent();
  if (!user) return NextResponse.json({ error: 'Only students can manage resumes' }, { status: 403 });
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!profile?.resumeUrl) return NextResponse.json({ error: 'No profile resume found' }, { status: 404 });
    const resumeUrl = profile.resumeUrl;
    await prisma.studentProfile.update({ where: { userId: user.id }, data: { resumeUrl: null } });
    const usedInApplication = await prisma.application.count({ where: { studentId: profile.id, resumeUrl } });
    if (usedInApplication === 0 && resumeUrl.startsWith('/uploads/resumes/')) {
      try { await unlink(path.join(process.cwd(), 'public', 'uploads', 'resumes', path.basename(resumeUrl))); } catch { /* already removed */ }
    }
    return NextResponse.json({ message: 'Resume removed from profile' });
  } catch (error) {
    console.error('Resume delete error:', error);
    return NextResponse.json({ error: 'Unable to delete resume' }, { status: 500 });
  }
}
