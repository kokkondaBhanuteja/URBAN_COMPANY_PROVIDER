import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";
import Provider from "@/database/ProviderModel";
import User from "@/database/userModel";
import Service from "@/database/serviceModel";
import logger from "@/lib/logger";

const BOOKINGS_PER_PAGE = 5;

export async function GET(req: NextRequest) {
  await connectDb();
  logger.info("Fetching bookings for a provider");

  try {
    const headersWithUser = await providerMiddleware(req);
    const userId = headersWithUser.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ message: "User ID not found" }, { status: 401 });
    }

    const provider = await Provider.findOne({ userId });
    if (!provider) {
      logger.warn(`Provider not found for userId: ${userId}`);
      return NextResponse.json({ message: "Provider not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status")?.toLowerCase();
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);

    let query: any = { providerId: provider._id };
    if (status && status !== "all") {
      if (status === 'cancelled') {
        query.bookingStatus = { $in: ['cancelled_by_user', 'cancelled_by_provider', 'cancelled'] };
      } else {
        query.bookingStatus = status;
      }
    }

    if (startDate) {
      query.scheduledAt = { ...query.scheduledAt, $gte: new Date(startDate) };
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.scheduledAt = { ...query.scheduledAt, $lt: endOfDay };
    }
    
    if (search && search.trim() !== "") {
        const searchRegex = new RegExp(search, "i");
        const users = await User.find({ userName: searchRegex }).select("_id");
        const services = await Service.find({ serviceName: searchRegex }).select("_id");
        
        query.$or = [
          { "userId": { $in: users.map(u => u._id) } },
          { "serviceId": { $in: services.map(s => s._id) } },
          { "orderId": { $regex: searchRegex } }
        ];
      }
    
    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / BOOKINGS_PER_PAGE);

    const bookings = await Booking.find(query)
      .populate({ path: "userId", select: "userName mobileNumber" })
      .populate("serviceId", "serviceName")
      .sort({ scheduledAt: -1 })
      .skip((page - 1) * BOOKINGS_PER_PAGE)
      .limit(BOOKINGS_PER_PAGE);

    logger.info(`Successfully fetched bookings for providerId: ${provider._id}`);
    return NextResponse.json({ bookings, totalPages });

  } catch (error: any) {
    logger.error("Bookings fetch error:", { error: error.message, stack: error.stack });
    return NextResponse.json({ message: error.message || "An error occurred" }, { status: 500 });
  }
}