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

// PUT - edit user
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id } = await context.params;
    const body = await request.json();
    const { name, phone, role, isActive, status } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (role !== undefined) data.role = role.toUpperCase();
    if (isActive !== undefined) {
      data.isActive = isActive;
      data.status = isActive ? 'Active' : 'Inactive';
      const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: id } });
      if (studentProfile) await prisma.studentProfile.update({ where: { userId: id }, data: { isActive } });
    }
    if (status !== undefined) data.status = status;

    const user = await prisma.user.update({ where: { id }, data });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - deactivate user (soft delete via studentProfile.isActive or just delete)
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id } = await context.params;

    // Remove dependent records so the user row can be fully deleted
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: id } });
    if (studentProfile) {
      const apps = await prisma.application.findMany({ where: { studentId: studentProfile.id }, select: { id: true } });
      await prisma.interview.deleteMany({ where: { applicationId: { in: apps.map(a => a.id) } } });
      await prisma.evaluation.deleteMany({ where: { studentId: studentProfile.id } });
      await prisma.feedback.deleteMany({ where: { studentId: studentProfile.id } });
      await prisma.application.deleteMany({ where: { studentId: studentProfile.id } });
      await prisma.studentProfile.delete({ where: { id: studentProfile.id } });
    }

    const facultyProfile = await prisma.facultyProfile.findUnique({ where: { userId: id } });
    if (facultyProfile) {
      const internships = await prisma.internship.findMany({ where: { facultyId: facultyProfile.id }, select: { id: true } });
      const ids = internships.map(i => i.id);
      const apps = await prisma.application.findMany({ where: { internshipId: { in: ids } }, select: { id: true } });
      await prisma.interview.deleteMany({ where: { applicationId: { in: apps.map(a => a.id) } } });
      await prisma.evaluation.deleteMany({ where: { internshipId: { in: ids } } });
      await prisma.application.deleteMany({ where: { internshipId: { in: ids } } });
      await prisma.internship.deleteMany({ where: { facultyId: facultyProfile.id } });
      await prisma.facultyProfile.delete({ where: { id: facultyProfile.id } });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
