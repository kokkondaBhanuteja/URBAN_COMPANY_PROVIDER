import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import mongoose from "mongoose";
import { connectDb } from "@/lib/dbConnect";
import logger from '@/lib/logger';
import Provider from "@/database/ProviderModel";
import User from "@/database/userModel";
import Service from "@/database/serviceModel";

type DbAvailabilitySlot = {
  startTime: Date;
  endTime: Date;
  toObject: () => any; // Add the toObject method from Mongoose
};

// Define a type for the availability slot from the API request
type ApiAvailabilitySlot = {
  startTime: string;
  endTime: string;
  dayOfWeek: string; // Assuming dayOfWeek is also part of the slot
};
export async function GET(req: NextRequest) {
  await connectDb();
  logger.info("Fetching profile for a provider");

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
      logger.warn(`Provider or user not found for userId: ${userId}`);
      return NextResponse.json(
        { message: "Provider profile not found" },
        { status: 404 }
      );
    }

    const formattedAvailability = provider.availability.map((slot: DbAvailabilitySlot) => {
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

    const profileData = {
      name: user.userName,
      email: user.email,
      phone: user.mobileNumber,
      bio: provider.bio || "",
      location: provider.serviceableLocations,
      services: (provider.servicesOffered as any[]).map(
        (service) => service.serviceName
      ),
      availability: formattedAvailability,
    };

    logger.info(`Successfully fetched profile for userId: ${userId}`);
    return NextResponse.json(profileData);
  } catch (error: any) {
    logger.error("Profile fetch error:", { error: error.message, stack: error.stack });
    return NextResponse.json(
      { message: error.message || "An error occurred while fetching profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  await connectDb();
  const session = await mongoose.startSession();
  session.startTransaction();
  logger.info("Starting transaction to update provider profile");

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

    let convertedAvailability;
    if (updateData.availability && Array.isArray(updateData.availability)) {
        convertedAvailability = updateData.availability.map((slot:ApiAvailabilitySlot) => {
            const startTimeAsDate = new Date(`1970-01-01T${slot.startTime}:00`);
            const endTimeAsDate = new Date(`1970-01-01T${slot.endTime}:00`);

            return {
                ...slot,
                startTime: startTimeAsDate,
                endTime: endTimeAsDate,
            };
        });
    }

    await User.findByIdAndUpdate(userId, {
      userName: updateData.name,
      email: updateData.email,
      mobileNumber: updateData.phone,
    }, { session });
    logger.info(`User data updated for userId: ${userId}`);


    const serviceIds = await Service.find({
      serviceName: { $in: updateData.services },
    }).select("_id").session(session);

    const serviceObjectIds = serviceIds.map((s) => s._id);

    const provider = await Provider.findOneAndUpdate(
      { userId },
      {
        bio: updateData.bio,
        serviceableLocations: updateData.location,
        servicesOffered: serviceObjectIds,
        availability: convertedAvailability,
      },
      { new: true, session }
    ).populate("userId", "name email");

    if (!provider) {
      logger.warn(`Provider not found for userId: ${userId}`);
      return NextResponse.json(
        { message: "Provider profile not found" },
        { status: 404 }
      );
    }
    logger.info(`Provider data updated for userId: ${userId}`);


    await session.commitTransaction();
    logger.info(`Transaction committed for provider profile update: ${userId}`);
    session.endSession();


    return NextResponse.json(provider);
  } catch (error: any) {
    await session.abortTransaction();
    logger.error("Provider profile update transaction aborted", { error: error.message, stack: error.stack });
    session.endSession();
    return NextResponse.json(
      { message: error.message || "An error occurred while updating profile" },
      { status: 500 }
    );
  }
}