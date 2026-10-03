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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const mine = searchParams.get('mine') === 'true';
    
    let whereClause: any = { status: 'OPEN' };
    if (mine) {
      const user = await getUser();
      if (!user || user.role !== 'FACULTY') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      const facultyProfile = await prisma.facultyProfile.findUnique({ where: { userId: user.id } });
      if (!facultyProfile) return NextResponse.json({ error: 'Faculty profile not found' }, { status: 404 });
      whereClause = { facultyId: facultyProfile.id };
    }
    if (domain) {
      whereClause.domain = { contains: domain };
    }

    const internships = await prisma.internship.findMany({
      where: whereClause,
      include: {
        company: true,
        faculty: { include: { user: { select: { name: true } } } }
      }
    });

    return NextResponse.json(internships);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized. Only faculty can post internships.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, domain, duration, stipend, startDate, endDate, applicationDeadline, companyId } = body;

    // Validation for Dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const deadline = new Date(applicationDeadline);
    const now = new Date();

    if (start <= now || end <= now || deadline <= now) {
      return NextResponse.json({ error: 'Dates must be in the future' }, { status: 400 });
    }
    if (start >= end) {
      return NextResponse.json({ error: 'Start date must be before end date' }, { status: 400 });
    }

    // Validation for Duration
    const durationWeeks = parseInt(duration);
    if (durationWeeks < 4 || durationWeeks > 24) {
      return NextResponse.json({ error: 'Internship duration must be between 4 and 24 weeks' }, { status: 400 });
    }

    const facultyProfile = await prisma.facultyProfile.findUnique({ where: { userId: user.id } });
    if (!facultyProfile) {
      return NextResponse.json({ error: 'Faculty profile not found' }, { status: 404 });
    }

    let actualCompanyId = companyId;
    if (!actualCompanyId || actualCompanyId === 'dummy-company-id') {
      const firstCompany = await prisma.company.findFirst();
      if (firstCompany) {
        actualCompanyId = firstCompany.id;
      } else {
        const newCompany = await prisma.company.create({
          data: {
            name: "Default Tech Company",
            registrationNumber: "REG-" + Date.now(),
            location: "San Francisco",
            contactPerson: "Jane Doe"
          }
        });
        actualCompanyId = newCompany.id;
      }
    }

    const internship = await prisma.internship.create({
      data: {
        title,
        description,
        domain,
        duration: durationWeeks,
        stipend: parseFloat(stipend),
        startDate: start,
        endDate: end,
        applicationDeadline: deadline,
        status: 'PENDING',
        companyId: actualCompanyId,
        facultyId: facultyProfile.id
      }
    });

    return NextResponse.json(internship, { status: 201 });
  } catch (error) {
    console.error('Create internship error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
