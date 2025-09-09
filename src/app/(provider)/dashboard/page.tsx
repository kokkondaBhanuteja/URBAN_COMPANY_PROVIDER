"use client";

import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/shared/StatCard";
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


const fetchStats = async () => {
  const token = localStorage.getItem("provider_token");
  const res = await fetch("/api/provider/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });

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
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchStats,
  });

  if (isLoading) return <div>Loading dashboard...</div>;

  if (isError || !stats) {
    return <div>Error fetching dashboard data: {error?.message || "Stats data is missing."}</div>;
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
          value={stats.totalBookings}
          icon={Calendar}
          description="+12% from last month"
          trend="up"
        />
        <StatCard
          title="Upcoming Bookings"
          value={stats.upcomingBookings}
          icon={Clock}
          description="Next 7 days"
        />
        <StatCard
          title="Earnings This Month"
          value={`$${stats.monthlyEarnings.toFixed(2)}`}
          icon={DollarSign}
          description="+8% from last month"
          trend="up"
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating}
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
            <LineChart data={stats.earningsData}>
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