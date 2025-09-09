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

    // Calculate earnings summary
    const totalRevenue = await Booking.aggregate([
      {
        $match: {
          providerId: provider._id,
          bookingStatus: "completed",
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const pendingPayouts = await Booking.aggregate([
      {
        $match: {
          providerId: provider._id,
          bookingStatus: "completed",
          // payoutStatus: { $ne: "paid" }, // Assuming you add a payoutStatus field
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    // Get recent transactions
    const transactions = await Booking.find({
      providerId: provider._id,
      bookingStatus: "completed",
    })
      .populate("customerId", "name")
      .sort({ completedAt: -1 })
      .limit(20);

    const summary = {
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      pendingPayouts: pendingPayouts.length > 0 ? pendingPayouts[0].total : 0,
      thisMonth: 0, // You can add logic to calculate current month's earnings
      lastPayout: 0, // You can add logic to get the last payout amount
    };

    return NextResponse.json({ summary, transactions });
  } catch (error: any) {
    console.error("Earnings fetch error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while fetching earnings" },
      { status: 500 }
    );
  }
}
