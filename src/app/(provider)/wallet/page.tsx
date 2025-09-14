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
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

// API call function
const fetchWalletData = async () => {
  const res = await fetch("/api/provider/wallet");
  if (!res.ok) {
    throw new Error("Failed to fetch wallet data");
  }
  return res.json();
};

export default function ProviderWalletPage() {
  const {
    data: walletData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["providerWallet"],
    queryFn: fetchWalletData,
  });

  const handleWithdraw = () => {
    // In a real application, this would open a modal to enter bank details
    // and trigger a payout process on the backend.
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
          value={formatCurrency(walletData?.balance || 0)}
          icon={DollarSign}
          description="Available for withdrawal"
        />
        {/* You can add more stats here if needed */}
      </div>

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
                <TableHead>Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {walletData?.transactions?.length > 0 ? (
                walletData.transactions.map((tx: any) => (
                  <TableRow key={tx._id}>
                    <TableCell>
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </TableCell>
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
                      <span className="capitalize">{tx.reason.replace("_", " ")}</span>
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        tx.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}