"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, User, MapPin } from "lucide-react";
import Loader from "@/components/shared/Loader";
import ErrorMessage from "@/components/shared/ErrorMessage";

// Corrected Booking Interface
interface Booking {
  _id: string;
  consumerId: { // Changed from customerId to consumerId, which is an object
    userName: string;
  };
  serviceId: {
    serviceName: string;
  };
  scheduledAt: string;
  bookingStatus: "confirmed" | "pending" | "completed" | "cancelled";
  serviceAddress: {
    addressLine1: string;
  };
  // Changed totalPrice to a nested pricing object to match the actual data structure
  pricing?: {
    basePrice: number;
    finalAmount: number;
  };
}

const fetchBookings = async (): Promise<Booking[]> => {
  const res = await fetch("/api/provider/bookings");

  if (!res.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return res.json();
};

export default function BookingsPage() {
  const {
    data: bookings,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <ErrorMessage message={error.message || "Could not load bookings."} retry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-muted-foreground">
          Manage your upcoming and past bookings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>A list of all your assigned bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings && bookings.length > 0 ? (
                bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {/* Corrected to access nested userName */}
                      <span>{booking.consumerId?.userName ?? 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{booking.serviceId?.serviceName ?? 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(booking.scheduledAt).toLocaleDateString()}
                      <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                      {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {booking.serviceAddress?.addressLine1 ?? 'N/A'}
                    </div>
                  </TableCell>
                  {/* FIX: Changed booking.totalPrice to booking.pricing?.finalAmount and added optional chaining */}
                  <TableCell>${(booking.pricing?.finalAmount ?? 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(booking.bookingStatus)}>
                      {booking.bookingStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
