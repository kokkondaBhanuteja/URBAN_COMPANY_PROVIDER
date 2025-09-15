// src/components/shared/BookingDetails.tsx
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Tag,
  KeyRound,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

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
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [view, setView] = useState<"details" | "otp">("details");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setView("details");
      setOtp(new Array(6).fill(""));
    }
  }, [isOpen, booking]);

  useEffect(() => {
    if (view === "otp") {
      inputRefs.current[0]?.focus();
    }
  }, [view]);

  if (!booking) return null;

const handleOtpChange = (element: HTMLInputElement, index: number) => {
  const value = element.value;

  // Allow only numbers
  if (!/^[0-9]?$/.test(value)) return;

  const newOtp = [...otp];
  newOtp[index] = value;
  setOtp(newOtp);

  // If user entered a digit, move to next box
  if (value !== "" && index < 5) {
    inputRefs.current[index + 1]?.focus();
  }

  // If last box is filled, optionally auto-submit
  if (index === 5 && value !== "") {
    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === 6) {
      handleSubmitOtp();
    }
  }
};

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmitOtp = () => {
    const combinedOtp = otp.join("");
    if (combinedOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }
    onStatusChange("completed", combinedOtp);
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
        {view === "details" && (
          <>
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
                      {booking.serviceAddress.city}, {booking.serviceAddress.state} - {booking.serviceAddress.pincode}
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

            <DialogFooter className="mt-4">
              <div className="w-full space-y-2">
                {(booking.bookingStatus === "requested" || booking.bookingStatus === "assigned") && (
                  <Button
                    className="w-full"
                    onClick={() => onStatusChange("in_progress")}
                    disabled={isUpdating}
                  >
                    Start Service
                  </Button>
                )}
                {booking.bookingStatus === "in_progress" && (
                  <Button
                    className="w-full"
                    onClick={() => setView("otp")}
                    disabled={isUpdating}
                  >
                    Complete Service
                  </Button>
                )}
              </div>
            </DialogFooter>
          </>
        )}

        {view === "otp" && (
          <>
            <DialogHeader>
              <DialogTitle>Enter Completion OTP</DialogTitle>
              <DialogDescription>
                Please get the 6-digit code from the customer to finalize and complete this booking.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <div className="flex justify-center items-center gap-2">
                <KeyRound className="h-5 w-5 text-muted-foreground" />
                <Label htmlFor="otp" className="text-lg font-medium">OTP Code</Label>
              </div>
              <div className="flex justify-center gap-2">
                {otp.map((data, index) => (
                  <Input
                    key={index}
                    type="text"
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    maxLength={1}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-12 h-14 text-center text-2xl font-semibold"
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                className="w-full"
                onClick={handleSubmitOtp}
                disabled={isUpdating}
              >
                {isUpdating ? "Verifying..." : "Submit & Complete Booking"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetails;
