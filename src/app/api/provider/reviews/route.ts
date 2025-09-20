import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Review from "@/database/reviewModel";
import Provider from "@/database/ProviderModel";
import User from "@/database/userModel";
import logger from "@/lib/logger";


const REVIEWS_PER_PAGE = 5;

export async function GET(req: NextRequest) {
  await connectDb();
  logger.info("Fetching reviews for a provider");
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
      logger.warn(`Provider not found for userId: ${userId}`);
      return NextResponse.json(
        { message: "Provider profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const rating = searchParams.get("rating");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);

    const query: any = {
      providerId: provider._id,
    };

    if (rating && rating !== "all") {
      query.rating = parseInt(rating, 10);
    }

    if (startDate) {
      query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.createdAt = { ...query.createdAt, $lt: endOfDay };
    }
    
    if (search) {
      const searchRegex = new RegExp(search, "i");
      const users = await User.find({ userName: searchRegex }).select("_id");

      query.$or = [
        { comment: searchRegex },
        { consumerId: { $in: users.map(u => u._id) } }
      ];
    }

    const totalReviews = await Review.countDocuments(query);
    const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);

    const reviews = await Review.find(query)
      .populate({ path: "consumerId", select: "userName", model: User })
      .sort({ createdAt: -1 })
      .skip((page - 1) * REVIEWS_PER_PAGE)
      .limit(REVIEWS_PER_PAGE);

    const statsResult = await Review.aggregate([
      { $match: { providerId: provider._id } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      averageRating: provider.averageRating || 0,
      totalReviews: await Review.countDocuments({ providerId: provider._id }),
      fiveStars: statsResult.find(r => r._id === 5)?.count || 0,
      fourStars: statsResult.find(r => r._id === 4)?.count || 0,
    };

    logger.info(`Successfully fetched reviews for providerId: ${provider._id}`);
    return NextResponse.json({ reviews, stats, totalPages });
  } catch (error: any) {
    logger.error("Reviews fetch error:", { error: error.message, stack: error.stack });
    return NextResponse.json(
      {
        message:
          error.message || "An error occurred while fetching reviews",
      },
      { status: 500 }
    );
  }
}