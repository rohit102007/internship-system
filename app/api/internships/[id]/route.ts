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

// PUT - update internship details
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { id } = await context.params;
    const body = await request.json();
    const { title, description, domain, duration, stipend, startDate, endDate, applicationDeadline } = body;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (domain) updateData.domain = domain;
    if (duration) {
      const d = parseInt(duration);
      if (d < 4 || d > 24) return NextResponse.json({ error: 'Duration must be 4-24 weeks' }, { status: 400 });
      updateData.duration = d;
    }
    if (stipend) updateData.stipend = parseFloat(stipend);
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (applicationDeadline) updateData.applicationDeadline = new Date(applicationDeadline);

    const internship = await prisma.internship.update({ where: { id }, data: updateData });
    return NextResponse.json(internship);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - archive internship
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const { id } = await context.params;
    await prisma.internship.update({ where: { id }, data: { status: 'ARCHIVED' } });
    return NextResponse.json({ message: 'Internship archived' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
