// src/app/api/provider/bookings/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";
import Provider from "@/database/ProviderModel";
import Service from "@/database/serviceModel";
import User from "@/database/userModel";

export async function GET(req: NextRequest) {
  await connectDb();

  try {
    const headersWithUser = await providerMiddleware(req);
    const userId = headersWithUser.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID not found after middleware" },
        { status: 401 }
      );
    }

    const provider = await Provider.findOne({ userId });

    if (!provider) {
      return NextResponse.json(
        { message: "Provider profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: any = {
      providerId: provider._id,
    };

    if (status && status !== "all") {
      query.bookingStatus = status;
    }

    if (startDate) {
      query.scheduledAt = { ...query.scheduledAt, $gte: new Date(startDate) };
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.scheduledAt = { ...query.scheduledAt, $lt: endOfDay };
    }

    const bookings = await Booking.find(query)
      .populate({ path: "userId", select: "userName mobileNumber" }) // This line ensures mobileNumber is fetched
      .populate("serviceId", "serviceName")
      .sort({ scheduledAt: -1 });

    if (search) {
      const lowercasedSearch = search.toLowerCase();
      const filteredBookings = bookings.filter((booking) => {
        const user = booking.userId as any;
        const service = booking.serviceId as any;
        return (
          user?.userName?.toLowerCase().includes(lowercasedSearch) ||
          service?.serviceName?.toLowerCase().includes(lowercasedSearch)
        );
      });
      return NextResponse.json(filteredBookings);
    }

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json(
      {
        message:
          error.message || "An error occurred while fetching bookings",
      },
      { status: 500 }
    );
  }
}