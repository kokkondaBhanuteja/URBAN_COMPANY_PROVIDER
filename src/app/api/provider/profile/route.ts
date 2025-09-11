import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Provider from "@/database/ProviderModel";
import User from "@/database/userModel";
import Service from "@/database/serviceModel";


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

    const user = await User.findById(userId).select("userName email mobileNumber");
    const provider = await Provider.findOne({ userId }).populate(
      "servicesOffered",
      "serviceName"
    );

    if (!provider || !user) {
      return NextResponse.json(
        { message: "Provider profile not found" },
        { status: 404 }
      );
    }

    // --- START OF THE FIX ---
    const formattedAvailability = provider.availability.map(slot => {
        const startTime = new Date(slot.startTime);
        const endTime = new Date(slot.endTime);

        const formatTime = (date: Date) => {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        };

        return {
            ...slot.toObject(),
            startTime: formatTime(startTime),
            endTime: formatTime(endTime),
        };
    });
    // --- END OF THE FIX ---

    const profileData = {
      name: user.userName,
      email: user.email,
      phone: user.mobileNumber,
      bio: provider.bio || "",
      location: provider.serviceableLocations,
      services: (provider.servicesOffered as any[]).map(
        (service) => service.serviceName
      ),
      availability: formattedAvailability, // Use the newly formatted array
    };

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
      return NextResponse.json(
        { message: "User ID not found after middleware" },
        { status: 401 }
      );
    }

    const updateData = await req.json();

    // --- START OF THE FIX ---
    let convertedAvailability;
    if (updateData.availability && Array.isArray(updateData.availability)) {
        convertedAvailability = updateData.availability.map(slot => {
            const startTimeAsDate = new Date(`1970-01-01T${slot.startTime}:00`);
            const endTimeAsDate = new Date(`1970-01-01T${slot.endTime}:00`);

            return {
                ...slot,
                startTime: startTimeAsDate,
                endTime: endTimeAsDate,
            };
        });
    }
    // --- END OF THE FIX ---

    await User.findByIdAndUpdate(userId, {
      userName: updateData.name,
      email: updateData.email,
      mobileNumber: updateData.phone,
    });

    const serviceIds = await Service.find({
      serviceName: { $in: updateData.services },
    }).select("_id");

    const serviceObjectIds = serviceIds.map((s) => s._id);

    const provider = await Provider.findOneAndUpdate(
      { userId },
      {
        bio: updateData.bio,
        serviceableLocations: updateData.location,
        servicesOffered: serviceObjectIds,
        availability: convertedAvailability, // Use the new array with Date objects
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