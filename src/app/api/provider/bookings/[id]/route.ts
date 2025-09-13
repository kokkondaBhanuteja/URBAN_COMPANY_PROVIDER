// src/app/api/provider/bookings/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDb();
  try {
    // Secure the endpoint
    await providerMiddleware(req);

    const { id: bookingId } = params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { bookingStatus: status },
      { new: true }
    );

    if (!updatedBooking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error("Booking update error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}