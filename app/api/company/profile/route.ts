import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // For the demo, we fetch the first company as the generic company profile 
    // since the strict User-Company link isn't established in schema.
    let company = await prisma.company.findFirst();
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: "Default Tech Company",
          registrationNumber: "REG-" + Date.now(),
          location: "San Francisco",
          contactPerson: "Jane Doe"
        }
      });
    }
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, location, contactPerson } = body;
    
    if (!id) return NextResponse.json({ error: 'ID missing' }, { status: 400 });

    const company = await prisma.company.update({
      where: { id },
      data: { name, location, contactPerson }
    });
    return NextResponse.json(company);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
