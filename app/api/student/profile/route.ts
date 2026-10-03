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

export async function GET(request: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'STUDENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
      include: { user: { select: { name: true, email: true, phone: true } } }
    });

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'STUDENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await request.json();
    const { name, phone, department, gpa, resumeUrl } = body;

    // Validate GPA
    if (gpa !== undefined && gpa !== null) {
      const gpaVal = parseFloat(gpa);
      if (gpaVal < 0 || gpaVal > 4.0) {
        return NextResponse.json({ error: 'GPA must be between 0.0 and 4.0' }, { status: 400 });
      }
    }

    // Validate phone
    if (phone) {
      const phoneRegex = /^\+?[\d]{10,15}$/;
      if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
        return NextResponse.json({ error: 'Phone must be 10-15 digits' }, { status: 400 });
      }
    }

    // Validate resume URL (must end with .pdf)
    if (resumeUrl && !resumeUrl.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Resume must be a PDF file' }, { status: 400 });
    }

    // Update user name/phone
    await prisma.user.update({
      where: { id: user.id },
      data: { name, phone }
    });

    // Update student profile
    const profile = await prisma.studentProfile.update({
      where: { userId: user.id },
      data: {
        department,
        gpa: gpa !== undefined ? parseFloat(gpa) : undefined,
        resumeUrl
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getUser();
    if (!user || user.role !== 'STUDENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    await prisma.studentProfile.update({ where: { userId: user.id }, data: { isActive: false } });
    const response = NextResponse.json({ message: 'Student account deactivated' });
    response.cookies.set({ name: 'auth_token', value: '', maxAge: 0, path: '/' });
    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to deactivate account' }, { status: 500 });
  }
}
