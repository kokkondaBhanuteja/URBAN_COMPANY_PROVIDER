import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Wallet from "@/database/walletModel";
import WalletTransaction from "@/database/walletTransactionModel";

export async function GET(req: NextRequest) {
  await connectDb();
  try {
    const headers = await providerMiddleware(req);
    const userId = headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return NextResponse.json({ message: "Wallet not found for this provider" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query: any = { walletId: wallet._id };

    if (search) {
      query.description = new RegExp(search, "i");
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (startDate) {
      query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.createdAt = { ...query.createdAt, $lt: endOfDay };
    }

    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(50); 

    return NextResponse.json({
      balance: wallet.balance,
      transactions,
    });
  } catch (error: any) {
    console.error("Provider wallet fetch error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch wallet data" },
      { status: 500 }
    );
  }
}