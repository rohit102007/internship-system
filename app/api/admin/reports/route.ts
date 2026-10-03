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

    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalFaculty = await prisma.user.count({ where: { role: 'FACULTY' } });
    const totalCompanies = await prisma.company.count();
    const totalInternships = await prisma.internship.count();
    const openInternships = await prisma.internship.count({ where: { status: 'OPEN' } });
    const totalApplications = await prisma.application.count();
    const pendingApplications = await prisma.application.count({ where: { status: 'pending' } });
    const acceptedApplications = await prisma.application.count({ where: { status: 'accepted' } });
    const rejectedApplications = await prisma.application.count({ where: { status: 'rejected' } });
    const shortlistedApplications = await prisma.application.count({ where: { status: 'shortlisted' } });
    const totalInterviews = await prisma.interview.count();
    const completedInterviews = await prisma.interview.count({ where: { status: 'COMPLETED' } });
    const totalEvaluations = await prisma.evaluation.count();
    const totalFeedback = await prisma.feedback.count();

    const internships = await prisma.internship.findMany({ select: { stipend: true } });
    const avgStipend = internships.length > 0 ? internships.reduce((acc, curr) => acc + curr.stipend, 0) / internships.length : 0;

    // Top companies by internship count
    const companies = await prisma.company.findMany({
      include: { internships: { select: { id: true } } }
    });
    const topCompanies = companies
      .map(c => ({ name: c.name, count: c.internships.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Registration trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } }
    });

    return NextResponse.json({
      placementSummary: {
        totalStudents,
        totalStudentsPlaced: acceptedApplications,
        overallPlacementRate: totalStudents > 0 ? ((acceptedApplications / totalStudents) * 100).toFixed(2) : '0.00',
        averageStipend: avgStipend.toFixed(2)
      },
      applicationAnalytics: {
        totalApplications,
        pending: pendingApplications,
        shortlisted: shortlistedApplications,
        accepted: acceptedApplications,
        rejected: rejectedApplications,
        acceptanceRate: totalApplications > 0 ? ((acceptedApplications / totalApplications) * 100).toFixed(2) : '0.00'
      },
      systemOverview: {
        totalStudents,
        totalFaculty,
        totalCompanies,
        totalInternships,
        openInternships,
        totalInterviews,
        completedInterviews,
        totalEvaluations,
        totalFeedback,
        recentRegistrations
      },
      companyStatistics: topCompanies
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
