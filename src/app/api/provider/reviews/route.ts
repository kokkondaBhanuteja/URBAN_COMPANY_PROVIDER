import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Review from "@/database/reviewModel";
import Provider from "@/database/ProviderModel";
import User from "@/database/userModel"; // Ensure User model is imported for population

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

    const reviews = await Review.find({
      providerId: provider._id,
    })
      // FIX: Changed "customerId" to "consumerId" and "name" to "userName" to match the models
      .populate({ path: "consumerId", select: "userName", model: User })
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate review statistics
    const totalReviews = reviews.length;
    const fiveStars = reviews.filter((r) => r.rating === 5).length;
    const fourStars = reviews.filter((r) => r.rating === 4).length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const stats = {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      fiveStars,
      fourStars,
    };

    return NextResponse.json({ reviews, stats });
  } catch (error: any) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while fetching reviews" },
      { status: 500 }
    );
  }
}
