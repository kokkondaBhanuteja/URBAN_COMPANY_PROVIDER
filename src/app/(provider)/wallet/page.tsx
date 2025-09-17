"use client";

import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/shared/StatCard";
import Loader from "@/components/shared/Loader";
import ErrorMessage from "@/components/shared/ErrorMessage";
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
import { DollarSign, ArrowUp, ArrowDown, SearchIcon, FilterX } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

// API call function
const fetchWalletData = async (
  filters: {
    search: string;
    type: string;
    startDate: string;
    endDate: string;
  },
  page: number
) => {
  const url = new URL("/api/provider/wallet", window.location.origin);
  if (filters.search) url.searchParams.append("search", filters.search);
  if (filters.type && filters.type !== "all")
    url.searchParams.append("type", filters.type);
  if (filters.startDate)
    url.searchParams.append("startDate", filters.startDate);
  if (filters.endDate) url.searchParams.append("endDate", filters.endDate);
  url.searchParams.append("page", page.toString());

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("Failed to fetch wallet data");
  }
  return res.json();
};

export default function ProviderWalletPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
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
    data: walletData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["providerWallet", filters, currentPage],
    queryFn: () => fetchWalletData(filters, currentPage),
  });

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({ search: "", type: "all", startDate: "", endDate: "" });
  };

  const handleWithdraw = () => {
    toast.info("Withdrawal Feature Coming Soon!", {
      description: "This feature is currently under development.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
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
        <ErrorMessage message={error.message} retry={refetch} />
      </div>
    );
  }
  
  const { balance, transactions, totalPages } = walletData || { balance: 0, transactions: [], totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
          <p className="text-muted-foreground">
            View your balance and transaction history.
          </p>
        </div>
        <Button onClick={handleWithdraw}>Withdraw Funds</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Current Balance"
          value={formatCurrency(balance)}
          icon={DollarSign}
          description="Available for withdrawal"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-1/3">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger className="w-full md:w-auto">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
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
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            A record of all your wallet transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance Before</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions?.length > 0 ? (
                transactions.map((tx: any) => (
                  <TableRow key={tx._id}>
                    <TableCell>
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tx.type === "credit" ? (
                          <ArrowUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className="capitalize">{tx.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{tx.reason.replace(/_/g, " ")}</span>
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        tx.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(tx.balanceBefore)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(tx.balanceAfter)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No transactions found.
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