import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';

async function getAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const user = jwt.verify(token, JWT_SECRET) as { id: string, role: string };
    if (user.role !== 'ADMIN') return null;
    return user;
  } catch { return null; }
}

// GET all internships for admin (including pending approval)
export async function GET(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const internships = await prisma.internship.findMany({
      include: {
        company: true,
        faculty: { include: { user: { select: { name: true } } } },
        applications: { select: { id: true } }
      }
    });
    return NextResponse.json(internships);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - approve/reject internship posting
export async function PUT(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();
    const { internshipId, status } = body; // OPEN = approve, REJECTED = reject
    if (!internshipId || !['OPEN', 'REJECTED', 'CLOSED', 'ARCHIVED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid internship status' }, { status: 400 });
    }

    const internship = await prisma.internship.update({
      where: { id: internshipId },
      data: { status }
    });
    return NextResponse.json(internship);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - permanently delete an internship
export async function DELETE(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { internshipId } = await request.json();
    if (!internshipId) return NextResponse.json({ error: 'internshipId required' }, { status: 400 });

    const applications = await prisma.application.findMany({ where: { internshipId: internshipId }, select: { id: true } });
    const appIds = applications.map(a => a.id);
    await prisma.interview.deleteMany({ where: { applicationId: { in: appIds } } });
    await prisma.application.deleteMany({ where: { internshipId: internshipId } });
    await prisma.evaluation.deleteMany({ where: { internshipId: internshipId } });
    await prisma.internship.delete({ where: { id: internshipId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
