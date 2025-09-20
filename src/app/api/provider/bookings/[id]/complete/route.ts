import { type NextRequest, NextResponse } from "next/server";
import { providerMiddleware } from "@/middlewares/providerMiddleware";
import { connectDb } from "@/lib/dbConnect";
import Booking from "@/database/bookingModel";
import Wallet from "@/database/walletModel";
import WalletTransaction from "@/database/walletTransactionModel";
import Provider from "@/database/ProviderModel";
import LedgerTransaction from "@/database/ledgerTransactionModel";
import User from "@/database/userModel";
import mongoose from "mongoose";
import logger from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDb();
  const session = await mongoose.startSession();
  session.startTransaction();
  logger.info(`Starting transaction to complete booking: ${params.id}`);

  try {
    const headers = await providerMiddleware(req);
    const userId = headers.get("x-user-id");

    const { id: bookingId } = params;
    const { otp } = await req.json();

    if (!otp) {
      logger.warn(`OTP is required for booking completion. Booking ID: ${bookingId}`);
      return NextResponse.json({ message: "OTP is required" }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId).session(session);

    if (!booking) {
      logger.warn(`Booking not found: ${bookingId}`);
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }

    if (booking.bookingOtp !== otp) {
      logger.warn(`Invalid OTP for booking: ${bookingId}`);
      return NextResponse.json({ message: "Invalid OTP provided." }, { status: 400 });
    }

    const commissionRate = 0.10;
    const totalAmount = booking.pricing.finalAmount;
    const commissionAmount = totalAmount * commissionRate;
    const providerEarning = totalAmount - commissionAmount;

    const adminUser = await User.findOne({ userType: 'admin' }).session(session);
    if (!adminUser) {
        throw new Error("Admin user not found to process commission.");
    }
    const adminWallet = await Wallet.findOne({ userId: adminUser._id }).session(session);
    if (!adminWallet) {
        throw new Error("Admin wallet not found.");
    }

    adminWallet.balance += commissionAmount;
    await adminWallet.save({ session });

    const lastTransaction = await LedgerTransaction.findOne().sort({ createdAt: -1 }).session(session);
    const lastBalance = lastTransaction ? lastTransaction.platformBalance : 0;
    
    await LedgerTransaction.create([{
        type: 'revenue',
        description: `Revenue from Booking #${booking._id.toString().slice(-6)}`,
        credit: totalAmount,
        platformBalance: lastBalance + totalAmount,
        relatedBookingId: booking._id,
        relatedUserId: booking.userId,
    }], { session });

    const newBalanceAfterRevenue = lastBalance + totalAmount;
    await LedgerTransaction.create([{
        type: 'commission',
        description: `10% commission from Booking #${booking._id.toString().slice(-6)}`,
        credit: commissionAmount,
        platformBalance: newBalanceAfterRevenue + commissionAmount,
        relatedBookingId: booking._id,
    }], { session });

    const provider = await Provider.findById(booking.providerId).session(session);
    if (!provider) throw new Error("Provider profile not found for this booking.");
    
    const providerWallet = await Wallet.findById(provider.walletId).session(session);
    if (!providerWallet) throw new Error("Provider wallet not found.");

    const providerBalanceBefore = providerWallet.balance;
    providerWallet.balance += providerEarning;
    await providerWallet.save({ session });

    await WalletTransaction.create([{
      walletId: providerWallet._id,
      amount: providerEarning,
      type: "credit",
      reason: "booking_earning",
      balanceBefore: providerBalanceBefore,
      balanceAfter: providerWallet.balance,
      description: `Earning from booking for service: ${booking.serviceId}`, // serviceId is not populated here, so using the ID
      relatedBookingId: booking._id,
      relatedUserId: booking.userId,
    }], { session });

    booking.bookingStatus = "completed";
    booking.completedAt = new Date();
    await booking.save({ session });
    
    await session.commitTransaction();
    logger.info(`Transaction committed for booking completion: ${bookingId}`);
    session.endSession();
    
    return NextResponse.json(booking);
  } catch (error: any) {
    await session.abortTransaction();
    logger.error(`Booking completion transaction aborted for bookingId: ${params.id}`, { error: error.message, stack: error.stack });
    session.endSession();
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}