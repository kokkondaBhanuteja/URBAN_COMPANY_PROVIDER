import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { getProviderDashboardStats } from "@/services/provider/dashboardService";
import { connectDb } from "@/lib/dbConnect";
import Provider from "@/database/ProviderModel";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
    await connectDb();
    logger.info("Fetching dashboard stats for a provider");

    try {
        const headersWithUser = await providerMiddleware(req);
        
        const userId = headersWithUser.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ message: "User ID not found after middleware" }, { status: 401 });
        }
 
        const provider = await Provider.findOne({ userId });

        if (!provider) {
            logger.warn(`Provider not found for userId: ${userId}`);
            return NextResponse.json({ message: "Provider profile not found" }, { status: 404 });
        }

        const stats = await getProviderDashboardStats(provider._id.toString());
        logger.info(`Successfully fetched dashboard stats for providerId: ${provider._id}`);
        return NextResponse.json(stats);

    } catch (error: any) {
        logger.error("Middleware or Dashboard stats error:", { error: error.message, stack: error.stack });
        return NextResponse.json({ message: error.message || "An error occurred" }, { status: 401 });
    }
}