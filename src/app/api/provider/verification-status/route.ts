import { type NextRequest, NextResponse } from "next/server"
import { connectDb } from "@/lib/dbConnect"
import { providerMiddleware } from "@/middlewares/providerMiddleware"
import Provider from "@/database/ProviderModel"

export async function GET(req: NextRequest) {
  await connectDb()

  try {
    const headers = await providerMiddleware(req)
    const userId = headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ message: "User ID not found" }, { status: 400 })
    }

    const provider = await Provider.findOne({ userId })

    if (!provider) {
      return NextResponse.json({ message: "Provider not found" }, { status: 404 })
    }

    return NextResponse.json({
      isVerified: provider.isVerified,
      isActive: provider.isActive,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ message: errorMessage }, { status: 401 })
  }
}
