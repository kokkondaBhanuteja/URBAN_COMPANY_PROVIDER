import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";
import Wallet from "@/database/walletModel"; // <-- IMPORT
import WalletTransaction from "@/database/walletTransactionModel"; // <-- IMPORT
import Provider from "@/database/ProviderModel"; // <-- IMPORT
import LedgerTransaction from "@/database/ledgerTransactionModel"; // <-- IMPORT LEDGER
import User from "@/database/userModel"; // <-- IMPORT USER

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDb();
  try {
    const headers = await providerMiddleware(req);
    const userId = headers.get("x-user-id");

    const { id: bookingId } = params;
    const { otp } = await req.json();

    if (!otp) {
      return NextResponse.json({ message: "OTP is required" }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    if (booking.bookingOtp !== otp) {
      return NextResponse.json({ message: "Invalid OTP provided." }, { status: 400 });
    }
     // --- START: NEW FINANCIAL LOGIC ---
    const commissionRate = 0.10; // 10% platform commission
    const totalAmount = booking.pricing.finalAmount;
    const commissionAmount = totalAmount * commissionRate;
    const providerEarning = totalAmount - commissionAmount;

    // --- Admin Wallet & Ledger ---
    // 1. Find the admin user (assuming there's one admin for simplicity)
    const adminUser = await User.findOne({ userType: 'admin' });
    if (!adminUser) {
        throw new Error("Admin user not found to process commission.");
    }
    const adminWallet = await Wallet.findOne({ userId: adminUser._id });
    if (!adminWallet) {
        throw new Error("Admin wallet not found.");
    }

    // 2. Credit commission to admin wallet
    adminWallet.balance += commissionAmount;
    await adminWallet.save();

    // 3. Create Ledger Entries
    // First, find the last ledger entry to calculate the new running balance
    const lastTransaction = await LedgerTransaction.findOne().sort({ createdAt: -1 });
    const lastBalance = lastTransaction ? lastTransaction.platformBalance : 0;
    
    // Revenue entry (total amount customer paid)
    await LedgerTransaction.create({
        type: 'revenue',
        description: `Revenue from Booking #${booking._id.toString().slice(-6)}`,
        credit: totalAmount,
        platformBalance: lastBalance + totalAmount,
        relatedBookingId: booking._id,
        relatedUserId: booking.userId,
    });

    // Commission entry (platform's profit)
    const newBalanceAfterRevenue = lastBalance + totalAmount;
    await LedgerTransaction.create({
        type: 'commission',
        description: `10% commission from Booking #${booking._id.toString().slice(-6)}`,
        credit: commissionAmount,
        platformBalance: newBalanceAfterRevenue + commissionAmount, // Note: This is an internal transfer view
        relatedBookingId: booking._id,
    });
    // --- End Admin & Ledger ---


    // --- Provider Wallet ---
    const provider = await Provider.findById(booking.providerId);
    if (!provider) throw new Error("Provider profile not found for this booking.");
    
    const providerWallet = await Wallet.findById(provider.walletId);
    if (!providerWallet) throw new Error("Provider wallet not found.");

    const providerBalanceBefore = providerWallet.balance; // Capture balance before
    providerWallet.balance += providerEarning;
    await providerWallet.save();

    await WalletTransaction.create({
      walletId: providerWallet._id,
      amount: providerEarning,
      type: "credit",
      reason: "booking_earning",
      balanceBefore: providerBalanceBefore,
      balanceAfter: providerWallet.balance, // Capture balance after
      description: `Earning from booking for service: ${booking.serviceId.serviceName}`,
      relatedBookingId: booking._id,
      relatedUserId: booking.userId, // The consumer who paid
    });
    // --- END: NEW FINANCIAL LOGIC ---

    booking.bookingStatus = "completed";
    booking.completedAt = new Date();
    await booking.save();
    
    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Booking completion error:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}