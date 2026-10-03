import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { EMAIL_PATTERN, validPhone } from '@/lib/validation';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';
async function admin() { const token = (await cookies()).get('auth_token')?.value; try { return !!token && (jwt.verify(token, JWT_SECRET) as { role: string }).role === 'ADMIN'; } catch { return false; } }
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const id = (await context.params).id;
  const company = await prisma.company.findUnique({ where: { id }, include: { internships: true } });
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  const feedback = await prisma.feedback.findMany({ where: { type: 'STUDENT_ON_COMPANY', rating: { not: null } }, select: { rating: true, comments: true } });
  const ratings = feedback.filter(item => item.comments.startsWith(`[company:${id}]`)).map(item => item.rating as number);
  return NextResponse.json({ ...company, rating: ratings.length ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length : null, ratingCount: ratings.length });
}
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await admin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  try { const body = await request.json();
    if (body.contactEmail && !EMAIL_PATTERN.test(body.contactEmail)) return NextResponse.json({ error: 'Invalid contact email' }, { status: 400 });
    if (body.contactPhone && !validPhone(body.contactPhone)) return NextResponse.json({ error: 'Phone must contain 10-15 digits' }, { status: 400 });
    const { name, registrationNumber, location, contactPerson, contactEmail, contactPhone } = body;
    return NextResponse.json(await prisma.company.update({ where: { id: (await context.params).id }, data: { name, registrationNumber, location, contactPerson, contactEmail, contactPhone } }));
  } catch (error: any) { return NextResponse.json({ error: error?.code === 'P2002' ? 'Registration number already exists' : 'Unable to update company' }, { status: error?.code === 'P2002' ? 409 : 500 }); }
}
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  if (!await admin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  await prisma.company.update({ where: { id: (await context.params).id }, data: { isActive: false } });
  return NextResponse.json({ message: 'Company archived' });
}
