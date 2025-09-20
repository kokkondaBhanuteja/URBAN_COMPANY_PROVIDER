// src/app/api/services/route.ts
import { NextResponse } from 'next/server';
import { connectDb } from '@/lib/dbConnect';
import Service from '@/database/serviceModel';
import logger from '@/lib/logger';

export async function GET() {
  await connectDb();
  logger.info("Fetching all active services");
  try {
    const services = await Service.find({ isActive: true }).select('_id serviceName');
    logger.info("Successfully fetched all active services");
    return NextResponse.json(services);
  } catch (error) {
    logger.error("Failed to fetch services", { error });
    return NextResponse.json({ message: 'Failed to fetch services' }, { status: 500 });
  }
}