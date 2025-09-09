import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";
import Provider from "@/database/ProviderModel";
import Service from "@/database/serviceModel"; // Import Service model
import User from "@/database/userModel";     // Import User model

export async function GET(req: NextRequest) {
  await connectDb();

  try {
    const headersWithUser = await providerMiddleware(req);
    const userId = headersWithUser.get("x-user-id");

    if (!userId) {
        return NextResponse.json({ message: "User ID not found after middleware" }, { status: 401 });
    }

    const provider = await Provider.findOne({ userId });

    if (!provider) {
      return NextResponse.json(
        { message: "Provider profile not found" },
        { status: 404 }
      );
    }

    const bookings = await Booking.find({
      providerId: provider._id,
    })
      .populate({ path: "consumerId", select: "userName" }) // Correctly populate consumerId and select userName
      .populate("serviceId", "serviceName")
      .sort({ scheduledAt: -1 })
      .limit(50);

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while fetching bookings" },
      { status: 500 }
    );
  }
}

