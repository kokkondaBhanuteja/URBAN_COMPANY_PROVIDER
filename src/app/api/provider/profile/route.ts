import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Provider from "@/database/ProviderModel";
import User from "@/database/userModel";

export async function GET(req: NextRequest) {
  await connectDb();

  try {
    const headersWithUser = await providerMiddleware(req);
    const userId = headersWithUser.get("x-user-id");

    if (!userId) {
        return NextResponse.json({ message: "User ID not found after middleware" }, { status: 401 });
    }

    const provider = await Provider.findOne({ userId }).populate(
      "userId",
      "name email"
    );

    if (!provider) {
      return NextResponse.json(
        { message: "Provider profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(provider);
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while fetching profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  await connectDb();
  try {
    const headersWithUser = await providerMiddleware(req);
    const userId = headersWithUser.get("x-user-id");

    if (!userId) {
        return NextResponse.json({ message: "User ID not found after middleware" }, { status: 401 });
    }

    const updateData = await req.json();

    // Update user basic info
    await User.findByIdAndUpdate(userId, {
      name: updateData.name,
      email: updateData.email,
    });

    // Update provider profile
    const provider = await Provider.findOneAndUpdate(
      { userId },
      {
        phone: updateData.phone,
        bio: updateData.bio,
        location: updateData.location,
        services: updateData.services,
        hourlyRate: updateData.hourlyRate,
        availability: updateData.availability,
      },
      { new: true }
    ).populate("userId", "name email");

    if (!provider) {
      return NextResponse.json(
        { message: "Provider profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(provider);
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while updating profile" },
      { status: 500 }
    );
  }
}
