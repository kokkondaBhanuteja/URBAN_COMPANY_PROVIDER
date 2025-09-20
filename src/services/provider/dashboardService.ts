import Booking from "@/database/bookingModel";
import Provider from "@/database/ProviderModel";
import { Types } from "mongoose";
import logger from "@/lib/logger";

export const getProviderDashboardStats = async (providerId: string) => {
    logger.info(`Fetching dashboard stats for providerId: ${providerId}`);
    const providerObjectId = new Types.ObjectId(providerId);

    const upcomingBookingsCount = await Booking.countDocuments({
        providerId: providerObjectId,
        bookingStatus: { $in: ['confirmed', 'assigned'] },
        scheduledAt: { $gte: new Date() }
    });

    const monthlyEarningsResult = await Booking.aggregate([
        {
            $match: {
                providerId: providerObjectId,
                bookingStatus: 'completed',
                completedAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
                }
            }
        },
        { $group: { _id: null, total: { $sum: '$pricing.finalAmount' } } }
    ]);

    const providerData = await Provider.findById(providerId);

    const totalBookings = await Booking.countDocuments({ providerId: providerObjectId });

    const earningsData = await Booking.aggregate([
        {
            $match: {
                providerId: providerObjectId,
                bookingStatus: 'completed',
                completedAt: {
                    $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
                }
            }
        },
        {
            $group: {
                _id: { $month: "$completedAt" },
                total: { $sum: '$pricing.finalAmount' }
            }
        },
        {
            $sort: { "_id": 1 }
        },
        {
            $project: {
                _id: 0,
                month: {
                    "$let": {
                        "vars": {
                            "monthsInString": ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                        },
                        "in": {
                            "$arrayElemAt": ["$$monthsInString", "$_id"]
                        }
                    }
                },
                earnings: "$total"
            }
        }
    ]);

    logger.info(`Successfully fetched dashboard stats for providerId: ${providerId}`);
    return {
        upcomingBookings: upcomingBookingsCount,
        monthlyEarnings: monthlyEarningsResult.length > 0 ? monthlyEarningsResult[0].total : 0,
        averageRating: providerData?.averageRating ?? 0,
        totalBookings: totalBookings,
        earningsData: earningsData
    };
};