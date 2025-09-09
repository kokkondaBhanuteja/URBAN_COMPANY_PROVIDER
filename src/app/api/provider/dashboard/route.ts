import { NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { getProviderDashboardStats } from "@/services/provider/dashboardService";
import { connectDb } from "@/lib/dbConnect";
import Provider from "@/database/ProviderModel";

export async function GET(req: NextRequest) {
    await connectDb();

    try {
        // Run middleware and get the new headers
        const headersWithUser = await providerMiddleware(req);
        
        // Get the userId from the headers returned by the middleware
        const userId = headersWithUser.get('x-user-id');
        console.log("User ID from headers:", userId);

        if (!userId) {
            return NextResponse.json({ message: "User ID not found after middleware" }, { status: 401 });
        }
 
        const provider = await Provider.findOne({ userId });
        console.log("Provider found:", provider);

        if (!provider) {
            return NextResponse.json({ message: "Provider profile not found" }, { status: 404 });
        }

        const stats = await getProviderDashboardStats(provider._id.toString());
        console.log("Stats", stats)

        return NextResponse.json(stats);

    } catch (error: any) {
        // This will now catch errors from the middleware (e.g., "Token missing")
        console.error("Middleware or Dashboard stats error:", error.message);
        return NextResponse.json({ message: error.message || "An error occurred" }, { status: 401 });
    }
}
