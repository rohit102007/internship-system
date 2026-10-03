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
    const { name, phone, role } = body;

    const user = await prisma.user.update({
      where: { id },
      data: { name, phone, role: role?.toUpperCase() }
    });
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

    // Deactivate student profile if exists
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: id } });
    if (studentProfile) {
      await prisma.studentProfile.update({ where: { userId: id }, data: { isActive: false } });
    }

    // We don't hard-delete, we just mark inactive
    return NextResponse.json({ message: 'User deactivated' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
