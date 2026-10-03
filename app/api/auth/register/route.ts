import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { EMAIL_PATTERN, PASSWORD_PATTERN, validGpa, validPhone } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, role, department, gpa } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validation
    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!PASSWORD_PATTERN.test(password)) {
      return NextResponse.json({ error: 'Password must be at least 8 characters, include uppercase, lowercase, numbers, and special characters' }, { status: 400 });
    }
    const normalizedRole = role.toUpperCase();
    if (!['STUDENT', 'FACULTY'].includes(normalizedRole)) {
      return NextResponse.json({ error: 'Only student and faculty accounts can be self-registered' }, { status: 400 });
    }
    if (phone && !validPhone(phone)) return NextResponse.json({ error: 'Phone must contain 10-15 digits in international format' }, { status: 400 });
    if (normalizedRole === 'STUDENT' && (gpa === undefined || !validGpa(gpa))) {
      return NextResponse.json({ error: 'Student GPA must be between 0.0 and 4.0' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: normalizedRole,
      }
    });

    if (normalizedRole === 'STUDENT') {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          department,
          gpa: gpa ? parseFloat(gpa) : null,
        }
      });
    } else if (normalizedRole === 'FACULTY') {
      await prisma.facultyProfile.create({
        data: {
          userId: user.id,
          department,
        }
      });
    }

    return NextResponse.json({ message: 'User registered successfully', userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
