"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  SearchIcon,
  FilterX,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import ErrorMessage from "@/components/shared/ErrorMessage";
import BookingDetails from "@/components/shared/BookingDetails";
import { toast } from "sonner";

// Updated Booking Interface with all fields
interface Booking {
  _id: string;
  orderId: string;
  userId: {
    userName: string;
    mobileNumber?: string;
  };
  serviceId: {
    serviceName: string;
  };
  scheduledAt: string;
  createdAt: string;
  bookingStatus:
    | "requested"
    | "confirmed"
    | "assigned"
    | "in_progress"
    | "completed"
    | "cancelled_by_user"
    | "cancelled_by_provider";
  serviceAddress: {
    addressLine1: string;
    city: string;
    pincode: string;
    state: string;
  };
  pricing: {
    basePrice: number;
    finalAmount: number;
  };
  specialInstructions?: string;
}

const fetchBookings = async (filters: {
  search: string;
  status: string;
  startDate: string;
  endDate: string;
}): Promise<Booking[]> => {
  const url = new URL("/api/provider/bookings", window.location.origin);
  if (filters.search) url.searchParams.append("search", filters.search);
  if (filters.status && filters.status !== "all")
    url.searchParams.append("status", filters.status);
  if (filters.startDate)
    url.searchParams.append("startDate", filters.startDate);
  if (filters.endDate) url.searchParams.append("endDate", filters.endDate);

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return res.json();
};

// Function to update status for non-OTP actions
const updateBookingStatus = async ({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) => {
  const res = await fetch(`/api/provider/bookings/${bookingId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error("Failed to update booking status");
  }

  return res.json();
};

// Function for OTP-based completion
const completeBookingWithOtp = async ({
  bookingId,
  otp,
}: {
  bookingId: string;
  otp: string;
}) => {
  const res = await fetch(`/api/provider/bookings/${bookingId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to complete booking");
  }

  return res.json();
};

export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    startDate: "",
    endDate: "",
  });

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const {
    data: bookings,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => fetchBookings(filters),
  });

  const statusUpdateMutation = useMutation({
    mutationFn: updateBookingStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking status updated!");
      setSelectedBooking(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const completeBookingMutation = useMutation({
    mutationFn: completeBookingWithOtp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking completed successfully!");
      setSelectedBooking(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      startDate: "",
      endDate: "",
    });
  };

  const handleStatusChange = (status: string, otp?: string) => {
    if (!selectedBooking) return;

    if (status === "completed" && otp) {
      completeBookingMutation.mutate({ bookingId: selectedBooking._id, otp });
    } else {
      statusUpdateMutation.mutate({ bookingId: selectedBooking._id, status });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled_by_user":
      case "cancelled_by_provider":
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
        <ErrorMessage
          message={error.message || "Could not load bookings."}
          retry={refetch}
        />
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
          <CardTitle>Filter Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter UI remains the same */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            A list of all your assigned bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date & Time</TableHead>
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
                        <span>{booking.userId?.userName ?? "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.serviceId?.serviceName ?? "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(booking.scheduledAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      ${(booking.pricing?.finalAmount ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.bookingStatus)}>
                        {booking.bookingStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <BookingDetails
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={handleStatusChange}
        isUpdating={statusUpdateMutation.isPending || completeBookingMutation.isPending}
      />
    </div>
  );
}