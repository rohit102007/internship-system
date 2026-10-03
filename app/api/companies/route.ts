import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { EMAIL_PATTERN, validPhone } from '@/lib/validation';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';

async function isAdmin() {
  const token = (await cookies()).get('auth_token')?.value;
  try { return !!token && (jwt.verify(token, JWT_SECRET) as { role: string }).role === 'ADMIN'; } catch { return false; }
}

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      include: { internships: { select: { id: true } } }
    });
    const feedback = await prisma.feedback.findMany({ where: { type: 'STUDENT_ON_COMPANY', rating: { not: null } }, select: { rating: true, comments: true } });
    const ratedCompanies = companies.map(company => {
      const ratings = feedback.filter(item => item.comments.startsWith(`[company:${company.id}]`)).map(item => item.rating as number);
      return { ...company, rating: ratings.length ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length : null, ratingCount: ratings.length };
    });
    return NextResponse.json(ratedCompanies);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  try {
    const { name, registrationNumber, location, contactPerson, contactEmail, contactPhone } = await request.json();
    if (![name, registrationNumber, location, contactPerson].every((value) => typeof value === 'string' && value.trim())) {
      return NextResponse.json({ error: 'Name, registration number, location, and contact person are required' }, { status: 400 });
    }
    if (contactEmail && !EMAIL_PATTERN.test(contactEmail)) return NextResponse.json({ error: 'Invalid contact email' }, { status: 400 });
    if (contactPhone && !validPhone(contactPhone)) return NextResponse.json({ error: 'Phone must contain 10-15 digits' }, { status: 400 });
    const company = await prisma.company.create({ data: { name, registrationNumber, location, contactPerson, contactEmail, contactPhone } });
    return NextResponse.json(company, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ error: 'Registration number already exists' }, { status: 409 });
    return NextResponse.json({ error: 'Unable to create company' }, { status: 500 });
  }
}
