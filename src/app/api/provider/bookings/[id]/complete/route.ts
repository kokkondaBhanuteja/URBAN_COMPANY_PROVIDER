import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDb();
  try {
    // Secure the endpoint by ensuring the user is a logged-in provider
    await providerMiddleware(req);

    const { id: bookingId } = params;
    const { otp } = await req.json();

    if (!otp) {
      return NextResponse.json({ message: "OTP is required" }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    // --- OTP Verification Logic ---
    if (booking.bookingOtp !== otp) {
      return NextResponse.json(
        { message: "Invalid OTP provided." },
        { status: 400 }
      );
    }

    // Find the booking and update its status to 'completed'
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        bookingStatus: "completed",
        completedAt: new Date(), // Set the completion timestamp
      },
      { new: true } // Return the updated document
    );

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error("Booking completion error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}