import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Provider from "@/database/ProviderModel";

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

    const { isActive } = await req.json();

    const provider = await Provider.findOneAndUpdate(
      { userId },
      { isActive },
      { new: true }
    );

    if (!provider) {
      return NextResponse.json(
        { message: "Provider profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ isActive: provider.isActive });
  } catch (error: any) {
    console.error("Availability update error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while updating availability" },
      { status: 500 }
    );
  }
}