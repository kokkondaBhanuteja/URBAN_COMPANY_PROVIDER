// src/app/api/services/route.ts
import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/dbConnect';
import Service from '@/database/serviceModel';

export async function GET() {
  await connectDb();
  try {
    // Select both '_id' and 'serviceName' to send to the frontend.
    const services = await Service.find({ isActive: true }).select('_id serviceName');
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch services' }, { status: 500 });
  }
}
