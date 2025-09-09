"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Eye, EyeOff, User, Mail, Phone, MapPin, FileText } from "lucide-react"
import Loader from "@/components/shared/Loader"

export default function ProviderRegistrationPage() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    bio: "",
    serviceableLocations: "",
  })

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.userName.trim()) return "Full name is required"
    if (!formData.email.trim()) return "Email is required"
    if (!formData.mobileNumber.trim()) return "Mobile number is required"
    if (!formData.password) return "Password is required"
    if (formData.password.length < 6) return "Password must be at least 6 characters"
    if (formData.password !== formData.confirmPassword) return "Passwords do not match"
    if (!formData.serviceableLocations.trim()) return "Service locations are required"

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return "Please enter a valid email"

    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.mobileNumber.replace(/\D/g, ""))) return "Please enter a valid 10-digit mobile number"

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      const registrationData = {
        userName: formData.userName.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.replace(/\D/g, ""),
        password: formData.password,
        userType: "provider",
        bio: formData.bio.trim(),
        serviceableLocations: formData.serviceableLocations
          .split(",")
          .map((loc) => loc.trim())
          .filter((loc) => loc),
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Registration failed")
      }

      setRegistrationSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (registrationSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md shadow-xl rounded-xl border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <User className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Registration Successful!</CardTitle>
            <CardDescription>
              Your account is pending Admin verification. Please wait until you are verified to access the provider
              dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex w-1/2 bg-gray-100">
        <img
          src="https://res.cloudinary.com/urbanclap/image/upload/t_high_res_template/dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images-stage/growth/blog/1718119004818-639fbe.jpeg"
          alt="Join as Service Provider"
          className="object-cover w-full h-full"
        />
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md shadow-xl rounded-xl border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Join as Service Provider</CardTitle>
            <CardDescription>Create your provider account and start earning with us.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8">
                <Loader />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="userName"
                    name="userName"
                    type="text"
                    value={formData.userName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className="focus:ring-2 focus:ring-gray-500 focus:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                    className="focus:ring-2 focus:ring-gray-500 focus:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Mobile Number
                  </Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your mobile number"
                    required
                    className="focus:ring-2 focus:ring-gray-500 focus:border-gray-600"
                  />
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a password (min 6 characters)"
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

                <div className="space-y-2 relative">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required
                    className="pr-10 focus:ring-2 focus:ring-gray-500 focus:border-gray-600"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-7 h-7 w-7 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceableLocations" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Service Locations
                  </Label>
                  <Input
                    id="serviceableLocations"
                    name="serviceableLocations"
                    type="text"
                    value={formData.serviceableLocations}
                    onChange={handleInputChange}
                    placeholder="Enter cities/areas you serve (comma separated)"
                    required
                    className="focus:ring-2 focus:ring-gray-500 focus:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Bio (Optional)
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about your experience and services..."
                    rows={3}
                    className="focus:ring-2 focus:ring-gray-500 focus:border-gray-600"
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" className="w-full">
                  Create Provider Account
                </Button>

                <p className="text-center text-sm text-muted-foreground pt-2">
                  Already have an account?{" "}
                  <a href="/login" className="text-primary hover:underline font-medium">
                    Sign in here
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
