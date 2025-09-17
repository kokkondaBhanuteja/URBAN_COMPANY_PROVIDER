"use client";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, User, FilterX, Users, SearchIcon } from "lucide-react"; // Corrected imports
import StatCard from "@/components/shared/StatCard";
import Loader from "@/components/shared/Loader";
import ErrorMessage from "@/components/shared/ErrorMessage";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

interface Review {
  _id: string;
  consumerId: {
    userName: string;
  };
  rating: number;
  comment: string;
  service: string;
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
  totalPages: number;
}

const fetchReviews = async (
  filters: { search: string; rating: string; startDate: string; endDate: string },
  page: number
): Promise<ReviewsData> => {
  const url = new URL("/api/provider/reviews", window.location.origin);
  if (filters.search) url.searchParams.append("search", filters.search);
  if (filters.rating && filters.rating !== "all")
    url.searchParams.append("rating", filters.rating);
  if (filters.startDate)
    url.searchParams.append("startDate", filters.startDate);
  if (filters.endDate) url.searchParams.append("endDate", filters.endDate);
  url.searchParams.append("page", page.toString());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
};

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    rating: "all",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 1000); // 1000ms debounce delay
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const {
    data: reviewsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["reviews", filters, currentPage],
    queryFn: () => fetchReviews(filters, currentPage),
  });

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({ search: "", rating: "all", startDate: "", endDate: "" });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${
            i <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
          }`}
        />
      );
    }
    return <div className="flex items-center">{stars}</div>;
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
          message={(error as Error).message || "Could not load reviews."}
          retry={refetch}
        />
      </div>
    );
  }

  const { reviews, stats, totalPages } = reviewsData!;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reviews & Ratings</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
            title="Average Rating"
            value={stats.averageRating.toFixed(1)}
            icon={Star}
        />
        <StatCard
            title="Total Reviews"
            value={stats.totalReviews}
            icon={Users}
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
          <CardTitle>Filter Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
             <div className="relative w-full md:w-1/3">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by customer or comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.rating}
              onValueChange={(value) => handleFilterChange("rating", value)}
            >
              <SelectTrigger className="w-full md:w-auto">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
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
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reviews.length > 0 ? (
                reviews.map((review) => (
                <div key={review._id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarImage />
                        <AvatarFallback>
                        {review.consumerId.userName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{review.consumerId.userName}</h4>
                        <div className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                        </div>
                        <div className="flex items-center my-2">
                        {renderStars(review.rating)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                        {review.comment}
                        </p>
                    </div>
                    </div>
                </div>
                ))
            ) : (
                <div className="text-center text-muted-foreground py-12">
                No reviews found for the selected filters.
                </div>
            )}
            </div>
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, totalPages || 1)
                    )
                  }
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>
    </div>
  );
}