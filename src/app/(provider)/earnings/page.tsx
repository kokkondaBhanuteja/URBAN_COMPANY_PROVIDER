"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, TrendingUp, Clock, Download } from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import Loader from "@/components/shared/Loader";
import ErrorMessage from "@/components/shared/ErrorMessage";


interface Transaction {
  _id: string;
  completedAt: string;
  serviceId: {
    serviceName: string;
  };
  totalPrice: number;
  bookingStatus: "completed" | "pending" | "processing";
}

interface Earnings {
  summary: {
    totalRevenue: number;
    pendingPayouts: number;
    thisMonth: number;
    lastPayout: number;
  };
  transactions: Transaction[];
}

const fetchEarnings = async (): Promise<Earnings> => {
  const res = await fetch("/api/provider/earnings");

  if (!res.ok) {
    throw new Error("Failed to fetch earnings");
  }

  return res.json();
};

export default function EarningsPage() {
  const {
    data: earningsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["earnings"],
    queryFn: fetchEarnings,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
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
        <ErrorMessage message={error.message || "Could not load earnings data."} retry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground">
          Track your revenue and manage payouts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${earningsData?.summary.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          description="All time earnings"
        />
        <StatCard
          title="Pending Payouts"
          value={`$${earningsData?.summary.pendingPayouts}`}
          icon={Clock}
          description="Available for withdrawal"
        />
        <StatCard
          title="This Month"
          value={`$${earningsData?.summary.thisMonth}`}
          icon={TrendingUp}
          description="+15% from last month"
          trend="up"
        />
        <StatCard
          title="Last Payout"
          value={`$${earningsData?.summary.lastPayout}`}
          icon={Download}
          description="Processed 3 days ago"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earningsData?.transactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>
                    {new Date(transaction.completedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.serviceId.serviceName}</TableCell>
                  <TableCell>
                    <Badge variant={"default"}>Earning</Badge>
                  </TableCell>
                  <TableCell className={"text-green-600"}>
                    +${Math.abs(transaction.totalPrice)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(transaction.bookingStatus)}>
                      {transaction.bookingStatus}
                    </Badge>
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