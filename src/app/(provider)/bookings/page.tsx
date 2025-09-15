// src/app/(provider)/bookings/page.tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import {
  Calendar,
  User,
  SearchIcon,
  FilterX,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import ErrorMessage from "@/components/shared/ErrorMessage";
import BookingDetails from "@/components/shared/BookingDetails";
import StatCard from "@/components/shared/StatCard";
import { toast } from "sonner";

// Interfaces
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
    | "cancelled_by_provider"
    | "cancelled";
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

interface Earnings {
  summary: {
    totalRevenue: number;
    pendingPayouts: number;
    thisMonth: number;
  };
}

// API Fetching Functions
const fetchBookings = async (
  filters: {
    search: string;
    status: string;
    startDate: string;
    endDate: string;
  },
  page: number
): Promise<{ bookings: Booking[]; totalPages: number }> => {
  const url = new URL("/api/provider/bookings", window.location.origin);
  if (filters.search) url.searchParams.append("search", filters.search);
  if (filters.status && filters.status !== "all")
    url.searchParams.append("status", filters.status);
  if (filters.startDate)
    url.searchParams.append("startDate", filters.startDate);
  if (filters.endDate) url.searchParams.append("endDate", filters.endDate);
  url.searchParams.append("page", page.toString());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
};

const fetchEarnings = async (): Promise<Earnings> => {
  const res = await fetch("/api/provider/earnings");
  if (!res.ok) throw new Error("Failed to fetch earnings");
  return res.json();
};

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
  if (!res.ok) throw new Error("Failed to update booking status");
  return res.json();
};

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

// Main Component
export default function BookingsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 1000);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    isError: isErrorBookings,
    error: errorBookings,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["bookings", filters, currentPage],
    queryFn: () => fetchBookings(filters, currentPage),
  });

  const {
    data: earningsData,
    isLoading: isLoadingEarnings,
    isError: isErrorEarnings,
    error: errorEarnings,
    refetch: refetchEarnings,
  } = useQuery({
    queryKey: ["earningsSummary"],
    queryFn: fetchEarnings,
  });

  const statusUpdateMutation = useMutation({
    mutationFn: updateBookingStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking status updated!");
      setSelectedBooking(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const completeBookingMutation = useMutation({
    mutationFn: completeBookingWithOtp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking completed successfully!");
      setSelectedBooking(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };


  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({ search: "", status: "all", startDate: "", endDate: "" });
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
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (isLoadingBookings || isLoadingEarnings) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader />
      </div>
    );
  }

  if (isErrorBookings || isErrorEarnings) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <ErrorMessage
          message={
            (errorBookings as Error)?.message ||
            (errorEarnings as Error)?.message ||
            "Could not load data."
          }
          retry={() => {
            refetchBookings();
            refetchEarnings();
          }}
        />
      </div>
    );
  }
  
  const { bookings, totalPages } = bookingsData || { bookings: [], totalPages: 1 };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(earningsData?.summary.totalRevenue || 0)}
          icon={DollarSign}
        />
        <StatCard
          title="Pending Payouts"
          value={formatCurrency(earningsData?.summary.pendingPayouts || 0)}
          icon={Clock}
        />
        <StatCard
          title="This Month"
          value={formatCurrency(earningsData?.summary.thisMonth || 0)}
          icon={TrendingUp}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Bookings</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-1/3">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by customer or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-full md:w-auto">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="requested">Requested</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full md:w-auto"
            />
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full md:w-auto"
            />
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex items-center gap-2"
            >
              <FilterX className="h-4 w-4" />
              Clear Filters
            </Button>
          </div>
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
                      {formatCurrency(booking.pricing?.finalAmount ?? 0)}
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
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        prev + 1,
                        totalPages || 1
                      )
                    )
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      <BookingDetails
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={handleStatusChange}
        isUpdating={
          statusUpdateMutation.isPending || completeBookingMutation.isPending
        }
      />
    </div>
  );
}