'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ProviderLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to login');
      }

      const { token } = await res.json();
      localStorage.setItem('provider_token', token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side image */}
      <div className="hidden md:flex w-1/2 bg-gray-100">
        <img
          src="https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images-stage/growth/blog/1718119004818-639fbe.jpeg"
          alt="Service Provider Visual"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Right side login form */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gradient-to-br from-white to-gray-50 p-6">
        <Card className="w-full max-w-sm shadow-2xl rounded-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Service Partner Login
            </CardTitle>
            <CardDescription className="text-gray-600">
              Welcome back! Sign in to manage your bookings, earnings, and profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-800">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="focus:ring-2 focus:ring-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-800">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="focus:ring-2 focus:ring-gray-600"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-black text-white font-medium rounded-lg shadow-md"
              >
                Log In
              </Button>
              <p className="text-center text-sm text-gray-500 mt-3">
                New partner?{" "}
                <a href="/register" className="text-gray-800 hover:text-black underline">
                  Join Urban Company
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
