"use client";

import { useState, useEffect } from "react";
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
import {
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  Info,
  Hash,
  MessageSquare,
  Phone,
  AlertCircle,
} from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

const BookingActions = ({
  status,
  onStatusChange,
  onStartCompleteProcess,
}: {
  status: string;
  onStatusChange: (status: string) => void;
  onStartCompleteProcess: () => void;
}) => {
  const handleAction = (newStatus: string) => {
    onStatusChange(newStatus);
  };

  return (
    <div className="flex gap-2 mt-4">
      {status === "assigned" && (
        <Button onClick={() => handleAction("in_progress")} size="sm">
          Start Service
        </Button>
      )}
      {status === "in_progress" && (
        <Button onClick={onStartCompleteProcess} size="sm">
          Mark as Completed
        </Button>
      )}
    </div>
  );
};

export default function BookingDetails({
  booking,
  isOpen,
  onClose,
  onStatusChange,
  isUpdating,
}: BookingDetailsProps) {
  const [showOtpView, setShowOtpView] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleVerifyAndComplete = () => {
    setOtpError(null);
    if (otp.length < 6) {
      setOtpError("Please enter a 6-digit OTP.");
      return;
    }
    onStatusChange("completed", otp);
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setShowOtpView(false);
        setOtp("");
        setOtpError(null);
      }, 300);
    }
  }, [isOpen]);

  if (!booking) return null;

  const renderOtpView = () => (
    <>
      <DialogHeader>
        <DialogTitle>Complete Service</DialogTitle>
        <DialogDescription>
          Enter the 6-digit OTP from the customer to complete this booking.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4 py-4">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => setOtp(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        {otpError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>{otpError}</AlertDescription>
          </Alert>
        )}
      </div>
      <DialogFooter className="sm:justify-between">
        <Button variant="outline" onClick={() => setShowOtpView(false)}>
          Back to Details
        </Button>
        <Button onClick={handleVerifyAndComplete} disabled={isUpdating}>
          {isUpdating ? "Verifying..." : "Verify & Complete"}
        </Button>
      </DialogFooter>
    </>
  );

  const renderDetailsView = () => (
    <>
      <DialogHeader>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogDescription>Order ID: {booking.orderId}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 py-4 text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Customer:</span>
          <span>{booking.userId?.userName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Contact:</span>
          <span>{booking.userId?.mobileNumber || "N/A"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Service:</span>
          <span>{booking.serviceId?.serviceName}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
          <div>
            <span className="font-medium">Address:</span>
            <p className="text-muted-foreground">{`${booking.serviceAddress.addressLine1}, ${booking.serviceAddress.city}, ${booking.serviceAddress.state} - ${booking.serviceAddress.pincode}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Scheduled for:</span>
          <span>{new Date(booking.scheduledAt).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Booked on:</span>
          <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Final Amount:</span>
          <span className="font-bold">
            ${booking.pricing.finalAmount.toFixed(2)}
          </span>
        </div>
        {booking.specialInstructions && (
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <span className="font-medium">Special Instructions:</span>
              <p className="text-muted-foreground italic">
                "{booking.specialInstructions}"
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 pt-2">
          <span className="font-medium text-muted-foreground">Status:</span>
          <Badge>{booking.bookingStatus}</Badge>
        </div>
      </div>
      <DialogFooter>
        <BookingActions
          status={booking.bookingStatus}
          onStatusChange={onStatusChange}
          onStartCompleteProcess={() => setShowOtpView(true)}
        />
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {showOtpView ? renderOtpView() : renderDetailsView()}
      </DialogContent>
    </Dialog>
  );
}