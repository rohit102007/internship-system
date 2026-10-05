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

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Students can only withdraw their own applications
    if (user.role === 'STUDENT') {
      const body = await request.json();
      if (body.status !== 'withdrawn') {
        return NextResponse.json({ error: 'Students can only withdraw applications' }, { status: 403 });
      }
      const { id } = await context.params;
      const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      const app = await prisma.application.findUnique({ where: { id } });
      if (!app || app.studentId !== profile?.id) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      const application = await prisma.application.update({ where: { id }, data: { status: 'withdrawn' } });
      return NextResponse.json(application);
    }

    if (user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { id } = await context.params;

    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'shortlisted', 'rejected', 'accepted', 'withdrawn'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const ownedApplication = await prisma.application.findFirst({ where: { id, internship: { facultyId: (await prisma.facultyProfile.findUnique({ where: { userId: user.id } }))?.id } } });
    if (!ownedApplication) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    if (status === 'accepted') {
      // A student can only be accepted for one internship
      const alreadyAccepted = await prisma.application.findFirst({
        where: { studentId: ownedApplication.studentId, status: 'accepted', id: { not: ownedApplication.id } }
      });
      if (alreadyAccepted) {
        return NextResponse.json({ error: 'This student is already accepted for another internship. Only one acceptance is allowed.' }, { status: 409 });
      }

      const application = await prisma.application.update({ where: { id }, data: { status } });
      // Auto-close the student's other open applications
      await prisma.application.updateMany({
        where: { studentId: ownedApplication.studentId, id: { not: ownedApplication.id }, status: { in: ['pending', 'shortlisted'] } },
        data: { status: 'rejected' }
      });
      return NextResponse.json(application);
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
