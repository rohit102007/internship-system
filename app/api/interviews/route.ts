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
    if (!user || user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { applicationId, date, time, interviewerDetails } = body;

    const interviewDate = new Date(date + 'T' + time);
    const now = new Date();
    const hoursDifference = (interviewDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return NextResponse.json({ error: 'Interview must have at least 24 hours notice' }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { internship: true }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const facultyProfile = await prisma.facultyProfile.findUnique({ where: { userId: user.id } });
    if (application.internship.facultyId !== facultyProfile?.id) {
      return NextResponse.json({ error: 'You can only schedule interviews for your own internships' }, { status: 403 });
    }

    if (interviewDate > new Date(application.internship.applicationDeadline)) {
      return NextResponse.json({ error: 'Cannot schedule an interview after the application deadline' }, { status: 400 });
    }

    const interview = await prisma.interview.create({
      data: {
        applicationId,
        date: interviewDate,
        time,
        interviewerDetails,
      }
    });

    return NextResponse.json(interview, { status: 201 });
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
      const interviews = await prisma.interview.findMany({
        where: { application: { studentId: profile?.id } },
        include: { application: { include: { internship: { include: { company: true } } } } }
      });
      return NextResponse.json(interviews);
    } else if (user.role === 'FACULTY') {
      const profile = await prisma.facultyProfile.findUnique({ where: { userId: user.id } });
      const interviews = await prisma.interview.findMany({
        where: { application: { internship: { facultyId: profile?.id } } },
        include: { application: { include: { student: { include: { user: true } }, internship: true } } }
      });
      return NextResponse.json(interviews);
    }

    return NextResponse.json({ error: 'Role not supported' }, { status: 403 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
