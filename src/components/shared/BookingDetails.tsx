import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Tag,
  MessageSquare,
  DollarSign,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Define the structure of the Booking object
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

interface BookingDetailsProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: string, otp?: string) => void;
  isUpdating: boolean;
}

const BookingDetails = ({
  booking,
  isOpen,
  onClose,
  onStatusChange,
  isUpdating,
}: BookingDetailsProps) => {
  const [otp, setOtp] = useState("");

  if (!booking) return null;

  const handleStatusUpdate = (status: string) => {
    if (status === "completed") {
      if (otp.length !== 6) {
        toast.error("Please enter the 6-digit completion OTP.");
        return;
      }
      onStatusChange(status, otp);
    } else {
      onStatusChange(status);
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
  
   const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>Order ID: {booking.orderId}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Service & Schedule</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>{booking.serviceId.serviceName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(booking.scheduledAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(booking.scheduledAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Customer Information</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{booking.userId.userName}</span>
              </div>
              {booking.userId.mobileNumber && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <User className="h-4 w-4" />
                  <span>{booking.userId.mobileNumber}</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 mt-1" />
                <address className="not-italic">
                  {booking.serviceAddress.addressLine1}, <br />
                  {booking.serviceAddress.city}, {booking.serviceAddress.state}{" "}
                  - {booking.serviceAddress.pincode}
                </address>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Booking Status</h4>
              <Badge className={getStatusColor(booking.bookingStatus)}>
                {booking.bookingStatus.replace(/_/g, " ")}
              </Badge>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Pricing Details</h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price</span>
                <span>{formatCurrency(booking.pricing.basePrice)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold mt-2">
                <span>Final Amount</span>
                <span>{formatCurrency(booking.pricing.finalAmount)}</span>
              </div>
            </div>
            {booking.specialInstructions && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Special Instructions</h4>
                  <p className="text-sm text-muted-foreground">
                    {booking.specialInstructions}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="mt-4">
          <div className="w-full space-y-4">
            {booking.bookingStatus === "confirmed" && (
              <Button
                className="w-full"
                onClick={() => handleStatusUpdate("in_progress")}
                disabled={isUpdating}
              >
                Start Service
              </Button>
            )}
            {booking.bookingStatus === "in_progress" && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
                <Button
                  className="w-full"
                  onClick={() => handleStatusUpdate("completed")}
                  disabled={isUpdating}
                >
                  Complete Service
                </Button>
              </div>
            )}
            {(booking.bookingStatus === "confirmed" ||
              booking.bookingStatus === "assigned") && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleStatusUpdate("cancelled_by_provider")}
                disabled={isUpdating}
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetails;