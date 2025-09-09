"use client";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, User } from "lucide-react";
import StatCard from "../../../components/shared/StatCard";
import Loader from "@/components/shared/Loader";
import ErrorMessage from "@/components/shared/ErrorMessage";
interface Review {
  _id: string;
  consumerId: {
    userName: string;
  };
  rating: number;
  comment: string;
  service: string; // This might need to be populated from bookingId->serviceId
  createdAt: string;
}
interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  fiveStars: number;
  fourStars: number;
}
interface ReviewsData {
  reviews: Review[];
  stats: ReviewStats;
}
const fetchReviews = async (): Promise<ReviewsData> => {
  const token = localStorage.getItem("provider_token");
  const res = await fetch("/api/provider/reviews", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch reviews");
  }
  return res.json();
};
export default function ReviewsPage() {
  const {
    data: reviewsData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["reviews"],
    queryFn: fetchReviews,
  });
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
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
        <ErrorMessage message={error.message || "Could not load reviews."} retry={refetch} />
      </div>
    );
  }
  
  const { reviews, stats } = reviewsData!;
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Reviews & Ratings</h1>
        <p className="text-muted-foreground">
          See what your customers are saying about your services.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Average Rating"
          value={stats.averageRating}
          icon={Star}
        />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews}
          icon={User}
        />
        <StatCard
          title="5-Star Reviews"
          value={stats.fiveStars}
          icon={Star}
        />
        <StatCard
          title="4-Star Reviews"
          value={stats.fourStars}
          icon={Star}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={"/placeholder.svg"} />
                    <AvatarFallback>
                      {review.consumerId.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">
                          {review.consumerId.userName}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <Badge variant="outline">{review.service || "Service"}</Badge>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}