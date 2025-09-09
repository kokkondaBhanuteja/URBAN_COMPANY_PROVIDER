"use client"; // Add this line to make it a Client Component
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TriangleAlert } from 'lucide-react';
export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md text-center shadow-2xl rounded-xl">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
            <TriangleAlert className="h-8 w-8" />
          </div>
          <CardTitle className="mt-4 text-3xl font-bold">404 - Page Not Found</CardTitle>
          <CardDescription className="mt-2">
            The page you are looking for does not exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}