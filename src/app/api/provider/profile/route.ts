import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Provider from "@/database/ProviderModel";
import User from "@/database/userModel";
import Service from "@/database/serviceModel"; // Import the Service model

export async function GET(req: NextRequest) {
  await connectDb();

  try {
    const headersWithUser = await providerMiddleware(req);
    const userId = headersWithUser.get("x-user-id");

    if (!userId) {
        return NextResponse.json({ message: "User ID not found after middleware" }, { status: 401 });
    }

    // Fetch both user and provider details
    const user = await User.findById(userId).select("userName email mobileNumber");
    const provider = await Provider.findOne({ userId }).populate(
      "servicesOffered",
      "serviceName" // Populate only the serviceName
    );

    if (!provider || !user) {
      return NextResponse.json(
        { message: "Provider profile not found" },
        { status: 404 }
      );
    }

    // Combine data into a single profile object
    const profileData = {
        name: user.userName,
        email: user.email,
        phone: user.mobileNumber,
        bio: provider.bio || '',
        location: provider.serviceableLocations,
        // Map the populated services to an array of strings
        services: (provider.servicesOffered as any[]).map(service => service.serviceName),
    }

    return NextResponse.json(profileData);
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
      userName: updateData.name, // Corrected from userName
      email: updateData.email,
      mobileNumber: updateData.phone, // Corrected from mobileNumber
    });
    
    // Convert service names back to ObjectIds
    const serviceIds = await Service.find({
        serviceName: { $in: updateData.services }
    }).select('_id');

    const serviceObjectIds = serviceIds.map(s => s._id);

    // Update provider profile
    const provider = await Provider.findOneAndUpdate(
      { userId },
      {
        bio: updateData.bio,
        serviceableLocations: updateData.location,
        servicesOffered: serviceObjectIds, // Use the resolved ObjectIds
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