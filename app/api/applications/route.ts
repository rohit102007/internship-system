import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string, role: string, email: string };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized. Only students can apply.' }, { status: 403 });
    }

    const body = await request.json();
    const { internshipId, resumeUrl, coverLetter, qualifications } = body;
    if (!internshipId || !resumeUrl || typeof resumeUrl !== 'string' || (!resumeUrl.toLowerCase().endsWith('.pdf') && !resumeUrl.startsWith('/api/resumes/'))) {
      return NextResponse.json({ error: 'A PDF resume is required for every application' }, { status: 400 });
    }

    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }
    if (!studentProfile.isActive) return NextResponse.json({ error: 'Student account is deactivated' }, { status: 403 });
    const internship = await prisma.internship.findUnique({ where: { id: internshipId } });
    if (!internship || internship.status !== 'OPEN' || internship.applicationDeadline <= new Date()) {
      return NextResponse.json({ error: 'This internship is not accepting applications' }, { status: 400 });
    }

    // Duplicate check is handled by Prisma via @@unique, but let's check it explicitly for a better error message
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_internshipId: {
          studentId: studentProfile.id,
          internshipId
        }
      }
    });

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied for this internship.' }, { status: 409 });
    }

    const acceptedElsewhere = await prisma.application.findFirst({ where: { studentId: studentProfile.id, status: 'accepted' } });
    if (acceptedElsewhere) {
      return NextResponse.json({ error: 'You are already accepted for an internship, so you cannot apply for more.' }, { status: 409 });
    }

    const application = await prisma.application.create({
      data: {
        studentId: studentProfile.id,
        internshipId,
        resumeUrl,
        coverLetter,
        qualifications,
        status: 'pending'
      }
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      const apps = await prisma.application.findMany({
        where: { studentId: studentProfile?.id },
        include: { internship: { include: { company: true } } }
      });
      return NextResponse.json(apps);
    } else if (user.role === 'FACULTY') {
      const facultyProfile = await prisma.facultyProfile.findUnique({ where: { userId: user.id } });
      const apps = await prisma.application.findMany({
        where: { internship: { facultyId: facultyProfile?.id } },
        include: { student: { include: { user: { select: { name: true, email: true } } } }, internship: true }
      });
      return NextResponse.json(apps);
    }
    
    return NextResponse.json({ error: 'Role not supported for this endpoint' }, { status: 403 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
