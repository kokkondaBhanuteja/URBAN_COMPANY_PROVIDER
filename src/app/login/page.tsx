"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
// Cookies is no longer needed for checking auth status here
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import Loader from "@/components/shared/Loader"

export default function ProviderLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  // The useEffect to check for an existing token is removed.
  // The middleware handles this now.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to login")
      }

      // Instead of push, use replace so the login page isn't in the browser history.
      router.replace("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // The isCheckingAuth state is also no longer needed.

  return (
    <div className="flex w-full h-screen">
      <div className="hidden md:flex w-[60%] bg-gray-100 rounded-tr-[17rem] rounded-br-[17rem] overflow-hidden">
        <img
          src="https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images-stage/growth/blog/1718119004818-639fbe.jpeg"
          alt="Service Provider Visual"
          className="w-full h-full"
        />
      </div>

      <div className="flex w-full md:w-[40%] items-center justify-center bg-background p-6">
        <Card className="w-full max-w-sm shadow-xl rounded-xl border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Service Partner Login</CardTitle>
            <CardDescription>Sign in to manage your bookings and earnings.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8">
                <Loader />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    className="focus:ring-2 focus:ring-gray-500 focus:border-gray-600"
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="pr-10 focus:ring-2 focus:ring-gray-500 focus:border-gray-600"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-7 h-7 w-7 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Log In"}
                </Button>
                <p className="text-center text-sm text-muted-foreground pt-2">
                  New partner?{" "}
                  <a href="/register" className="text-primary hover:underline font-medium">
                    Join as Service Provider
                  </a>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}