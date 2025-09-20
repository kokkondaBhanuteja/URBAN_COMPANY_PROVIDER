import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";
import Provider from "@/database/ProviderModel";
import User from "@/database/userModel";
import Service from "@/database/serviceModel";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  await connectDb();
  logger.info("Fetching earnings for a provider");
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

    const totalRevenueResult = await Booking.aggregate([
      {
        $match: {
          providerId: provider._id,
          bookingStatus: "completed",
        },
      },
      { $group: { _id: null, total: { $sum: "$pricing.finalAmount" } } },
    ]);

    const pendingPayoutsResult = await Booking.aggregate([
      {
          $match: {
              providerId: provider._id,
              bookingStatus: { $in: ["assigned", "in_progress"] }
          }
      },
      { $group: { _id: null, total: { $sum: "$pricing.finalAmount" } } }
  ]);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthResult = await Booking.aggregate([
        {
            $match: {
                providerId: provider._id,
                bookingStatus: "completed",
                completedAt: { $gte: startOfMonth, $lte: endOfMonth }
            }
        },
        { $group: { _id: null, total: { $sum: "$pricing.finalAmount" } } }
    ]);

    const transactions = await Booking.find({
      providerId: provider._id,
      bookingStatus: "completed",
    })
      .populate({ path: "userId", select: "userName", model: User })
      .populate({ path: "serviceId", select: "serviceName", model: Service })
      .sort({ completedAt: -1 })
      .limit(20);

    const summary = {
      totalRevenue: totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0,
      pendingPayouts: pendingPayoutsResult.length > 0 ? pendingPayoutsResult[0].total : 0,
      thisMonth: thisMonthResult.length > 0 ? thisMonthResult[0].total : 0,
      lastPayout: 0,
    };

    logger.info(`Successfully fetched earnings for providerId: ${provider._id}`);
    return NextResponse.json({ summary, transactions });
  } catch (error: any) {
    logger.error("Earnings fetch error:", { error: error.message, stack: error.stack });
    return NextResponse.json(
      { message: error.message || "An error occurred while fetching earnings" },
      { status: 500 }
    );
  }
}