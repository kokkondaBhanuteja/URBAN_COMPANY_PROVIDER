// src/app/api/provider/bookings/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";
import logger from "@/lib/logger";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDb();
  const { id: bookingId } = params;
  logger.info(`Attempting to update booking: ${bookingId}`);

  try {
    await providerMiddleware(req);

    const { status } = await req.json();

    if (!status) {
      logger.warn(`Update failed for booking ${bookingId}: Status is required`);
      return NextResponse.json({ message: "Status is required" }, { status: 400 });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { bookingStatus: status },
      { new: true }
    );

    if (!updatedBooking) {
      logger.warn(`Update failed for booking ${bookingId}: Booking not found`);
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    logger.info(`Booking ${bookingId} updated successfully to status: ${status}`);
    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    logger.error(`Booking update error for bookingId ${bookingId}:`, { error: error.message, stack: error.stack });
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}