import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';
async function getFaculty() { const token = (await cookies()).get('auth_token')?.value; try { const user = jwt.verify(token!, JWT_SECRET) as { id: string; role: string }; return user.role === 'FACULTY' ? user : null; } catch { return null; } }
async function owns(id: string, userId: string) { const p = await prisma.facultyProfile.findUnique({ where: { userId } }); return prisma.evaluation.findFirst({ where: { id, internship: { facultyId: p?.id } } }); }
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) { const user = await getFaculty(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 }); const id = (await context.params).id; if (!await owns(id, user.id)) return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 }); const { criteria, scoring, feedback } = await request.json(); if (scoring !== undefined && (!Number.isFinite(Number(scoring)) || Number(scoring) < 1 || Number(scoring) > 5)) return NextResponse.json({ error: 'Score must be from 1 to 5' }, { status: 400 }); return NextResponse.json(await prisma.evaluation.update({ where: { id }, data: { criteria, scoring: scoring === undefined ? undefined : Number(scoring), feedback } })); }
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) { const user = await getFaculty(); if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 }); const id = (await context.params).id; if (!await owns(id, user.id)) return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 }); await prisma.evaluation.delete({ where: { id } }); return NextResponse.json({ message: 'Evaluation removed' }); }
