import { type NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/dbConnect"
import { providerMiddleware } from "@/middlewares/providerMiddleware"
import Provider from "@/database/ProviderModel"
import logger from "@/lib/logger"

export async function GET(req: NextRequest) {
  await connectDb()
  logger.info("Checking provider verification status");

  try {
    const headers = await providerMiddleware(req)
    const userId = headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ message: "User ID not found" }, { status: 400 })
    }

    const provider = await Provider.findOne({ userId })

    if (!provider) {
      logger.warn(`Provider not found for userId: ${userId}`);
      return NextResponse.json({ message: "Provider not found" }, { status: 404 })
    }

    logger.info(`Successfully checked verification status for userId: ${userId}`);
    return NextResponse.json({
      isVerified: provider.isVerified,
      isActive: provider.isActive,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    logger.error("Verification status check error:", { error: errorMessage });
    return NextResponse.json({ message: errorMessage }, { status: 401 })
  }
}