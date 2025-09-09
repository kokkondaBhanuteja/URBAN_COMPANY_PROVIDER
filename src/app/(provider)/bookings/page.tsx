"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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

interface Booking {
  _id: string;
  customerId:  string;
  serviceId: {
    serviceName: string;
  };
  scheduledAt: string;
  bookingStatus: "confirmed" | "pending" | "completed" | "cancelled";
  serviceAddress: {
    addressLine1: string;
  };
  totalPrice: number;
}

const fetchBookings = async (): Promise<Booking[]> => {
  const token = localStorage.getItem("provider_token");
  const res = await fetch("/api/provider/bookings", {
    headers: { Authorization: `Bearer ${token}` },
  });

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
  
  if (isLoading) return <div>Loading bookings...</div>;
  if (isError) return <div>Error fetching bookings</div>;

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
              {bookings?.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {booking.userId}
                    </div>
                  </TableCell>
                  <TableCell>{booking.serviceId.serviceName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(booking.scheduledAt).toLocaleDateString()}
                      <Clock className="h-4 w-4" />
                      {new Date(booking.scheduledAt).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {booking.serviceAddress.addressLine1}
                    </div>
                  </TableCell>
                  <TableCell>${booking.totalPrice}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}