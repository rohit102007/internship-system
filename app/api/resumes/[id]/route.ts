import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    return new Response(new Uint8Array(resume.data as Buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${resume.fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unable to load resume' }, { status: 500 });
  }
}
