import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";
import Provider from "@/database/ProviderModel";

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

    // Fetch recent bookings that are assigned or confirmed
    const recentBookings = await Booking.find({
      providerId: provider._id,
      bookingStatus: { $in: ["assigned", "confirmed"] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    })
      .populate({ path: "userId", select: "userName" })
      .sort({ createdAt: -1 });

    return NextResponse.json(recentBookings);
  } catch (error: any) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while fetching notifications" },
      { status: 500 }
    );
  }
}   