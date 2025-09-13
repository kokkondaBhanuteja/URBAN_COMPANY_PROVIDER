"use client";

import { useQuery } from "@tanstack/react-query";
import StatCard from "../../../components/shared/StatCard";
import { Calendar, Clock, DollarSign, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import Loader from "../../../components/shared/Loader";
import ErrorMessage from "../../../components/shared/ErrorMessage";

const fetchStats = async () => {
  const res = await fetch("/api/provider/dashboard");

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: "Failed to fetch stats" }));
    throw new Error(errorBody.message || "Failed to fetch stats");
  }

  return res.json();
};

export default function ProviderDashboardPage() {
  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchStats,
  });

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
        <ErrorMessage message={error?.message || "Could not load dashboard data."} retry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here is your performance summary.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings ?? 0}
          icon={Calendar}
          description="+12% from last month"
          trend="up"
        />
        <StatCard
          title="Upcoming Bookings"
          value={stats?.upcomingBookings ?? 0}
          icon={Clock}
          description="Next 7 days"
        />
        <StatCard
          title="Earnings This Month"
          value={`$${(stats?.monthlyEarnings ?? 0).toFixed(2)}`}
          icon={DollarSign}
          description="+8% from last month"
          trend="up"
        />
        <StatCard
          title="Average Rating"
          value={stats?.averageRating ?? 0}
          icon={Star}
          description="Based on 95 reviews"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Earnings Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              earnings: { label: "Earnings", color: "hsl(var(--chart-1))" },
            }}
          >
            <LineChart data={stats?.earningsData || []}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="var(--color-earnings)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

