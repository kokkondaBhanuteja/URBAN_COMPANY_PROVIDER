import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";

// A mock OTP for demonstration purposes. In a real application, this would be
// generated and stored securely, likely in a separate OTPs collection or cache.
const MOCK_OTP = "123456";

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

    // --- OTP Verification Logic ---
    // In a real-world scenario, you would fetch the OTP from your database or cache
    // and verify it against the one provided. For this example, we use a mock OTP.
    if (otp !== MOCK_OTP) {
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

    if (!updatedBooking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error("Booking completion error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}