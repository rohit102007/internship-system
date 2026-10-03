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

export async function GET(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    const internships = await prisma.internship.findMany({
      select: { id: true, title: true, stipend: true, duration: true, status: true, companyId: true }
    });
    const applications = await prisma.application.findMany({
      select: { id: true, status: true, studentId: true, internshipId: true, createdAt: true }
    });
    const companies = await prisma.company.findMany({
      select: { id: true, name: true, registrationNumber: true, location: true }
    });

    // Build CSV
    let csv = "Type,ID,Name/Title,Email/Status,Role/Stipend,Date\n";
    users.forEach(u => csv += `User,${u.id},${u.name},${u.email},${u.role},${u.createdAt.toISOString()}\n`);
    internships.forEach(i => csv += `Internship,${i.id},${i.title},${i.status},${i.stipend},\n`);
    applications.forEach(a => csv += `Application,${a.id},${a.studentId},${a.status},,${a.createdAt.toISOString()}\n`);
    companies.forEach(c => csv += `Company,${c.id},${c.name},${c.registrationNumber},${c.location},\n`);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="system_export.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
