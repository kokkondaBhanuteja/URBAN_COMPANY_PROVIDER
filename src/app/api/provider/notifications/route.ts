import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";
import Provider from "@/database/ProviderModel";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  await connectDb();
  logger.info("Fetching notifications for a provider");
  try {
    const headersWithUser = await providerMiddleware(req);
    const userId = headersWithUser.get("x-user-id");

    if (!userId) {
        return NextResponse.json({ message: "User ID not found after middleware" }, { status: 401 });
    }

    const provider = await Provider.findOne({ userId });

    if (!provider) {
      logger.warn(`Provider not found for userId: ${userId}`);
      return NextResponse.json(
        { message: "Provider profile not found" },
        { status: 404 }
      );
    }

    const recentBookings = await Booking.find({
      providerId: provider._id,
      bookingStatus: { $in: ["assigned", "confirmed"] },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .populate({ path: "userId", select: "userName" })
      .sort({ createdAt: -1 });

    logger.info(`Successfully fetched notifications for providerId: ${provider._id}`);
    return NextResponse.json(recentBookings);
  } catch (error: any) {
    logger.error("Notifications fetch error:", { error: error.message, stack: error.stack });
    return NextResponse.json(
      { message: error.message || "An error occurred while fetching notifications" },
      { status: 500 }
    );
  }   
}