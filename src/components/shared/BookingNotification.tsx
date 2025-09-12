"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";

interface Booking {
  _id: string;
  userId: {
    userName: string;
  };
  scheduledAt: string;
}

interface BookingNotificationProps {
  booking: Booking;
}

export function BookingNotification({ booking }: BookingNotificationProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">New Booking Scheduled!</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
          <User className="h-4 w-4" />
          {booking.userId.userName} has booked a service with you.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Scheduled for: {new Date(booking.scheduledAt).toLocaleString()}
        </p>
        <Button asChild size="sm" className="mt-2">
          <Link href={`/bookings`}>
            View Details
          </Link>
        </Button>
      </div>
    </div>
  );
}