import Booking from "@/database/bookingModel";
import Provider from "@/database/ProviderModel";
import { Types } from "mongoose";

export const getProviderDashboardStats = async (providerId: string) => {
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
                    $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                }
            }
        },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const providerData = await Provider.findById(providerId);

    const totalBookings = await Booking.countDocuments({ providerId: providerObjectId });

    // Real-time earnings data for the chart
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
                total: { $sum: '$totalPrice' }
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

    return {
        upcomingBookings: upcomingBookingsCount,
        monthlyEarnings: monthlyEarningsResult.length > 0 ? monthlyEarningsResult[0].total : 0,
        averageRating: providerData?.averageRating ?? 0,
        totalBookings: totalBookings,
        earningsData: earningsData
    };
};
