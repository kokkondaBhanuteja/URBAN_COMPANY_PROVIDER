"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Eye, EyeOff, User, Mail, Phone, MapPin, FileText, Briefcase } from "lucide-react"
import Loader from "../../components/shared/Loader"

// Updated interface to match the API response
interface Service {
  _id: string;
  serviceName: string;
}


export default function ProviderRegistrationPage() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    bio: "",
    serviceableLocations: "",
    servicesOffered: [] as string[], // This will now store an array of service IDs
  })

  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          const data = await res.json();
          setAvailableServices(data);
        }
      } catch (error) {
        console.error("Failed to fetch services", error);
      }
    };
    fetchServices();
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Updated to handle service IDs
  const handleMultiSelectChange = (serviceId: string) => {
    setFormData((prev) => {
    const services = prev.servicesOffered.includes(serviceId)
        ? prev.servicesOffered.filter((id) => id !== serviceId)
        : [...prev.servicesOffered, serviceId];
    return { ...prev, servicesOffered: services };
    });
};


  const validateForm = () => {
    if (!formData.userName.trim()) return "Full name is required"
    if (!formData.email.trim()) return "Email is required"
    if (!formData.mobileNumber.trim()) return "Mobile number is required"
    if (!formData.password) return "Password is required"
    if (formData.password.length < 6) return "Password must be at least 6 characters"
    if (formData.password !== formData.confirmPassword) return "Passwords do not match"
    if (!formData.serviceableLocations.trim()) return "Service locations are required"
    if (formData.servicesOffered.length === 0) return "Please select at least one service."


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
      // The servicesOffered field now correctly sends an array of IDs
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
        servicesOffered: formData.servicesOffered,
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
     <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <Card className="w-full max-w-2xl shadow-xl rounded-xl border">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-foreground">Join as a Service Provider</CardTitle>
                <CardDescription>Create your provider account to start connecting with customers.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="py-8"><Loader /></div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Column 1 */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="userName" className="flex items-center gap-2"><User className="h-4 w-4" />Full Name</Label>
                                <Input id="userName" name="userName" type="text" value={formData.userName} onChange={handleInputChange} placeholder="Enter your full name" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4" />Email Address</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mobileNumber" className="flex items-center gap-2"><Phone className="h-4 w-4" />Mobile Number</Label>
                                <Input id="mobileNumber" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleInputChange} placeholder="Enter your mobile number" required />
                            </div>

                            <div className="space-y-2 relative">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} placeholder="Create a strong password" required className="pr-10" />
                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>

                            <div className="space-y-2 relative">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm your password" required className="pr-10" />
                                 <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="serviceableLocations" className="flex items-center gap-2"><MapPin className="h-4 w-4" />Service Locations</Label>
                                <Input id="serviceableLocations" name="serviceableLocations" type="text" value={formData.serviceableLocations} onChange={handleInputChange} placeholder="e.g., New York, Los Angeles" required />
                                <p className="text-xs text-muted-foreground">Enter locations separated by commas.</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Briefcase className="h-4 w-4" />Services Offered</Label>
                                <div className="p-2 border rounded-md h-40 overflow-y-auto">
                                {availableServices.map((service) => (
                                    <div key={service._id} className="flex items-center gap-2 p-1">
                                    <input
                                        type="checkbox"
                                        id={service._id}
                                        // Check against the service ID
                                        checked={formData.servicesOffered.includes(service._id)}
                                        // Pass the service ID to the handler
                                        onChange={() => handleMultiSelectChange(service._id)}
                                    />
                                    <label htmlFor={service._id}>{service.serviceName}</label>
                                    </div>
                                ))}
                                </div>
                            </div>


                            <div className="space-y-2">
                                <Label htmlFor="bio" className="flex items-center gap-2"><FileText className="h-4 w-4" />Bio (Optional)</Label>
                                <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us about your experience..." rows={3} />
                            </div>
                        </div>

                        {/* Footer (spanning both columns) */}
                        <div className="md:col-span-2">
                            {error && <p className="text-sm text-center text-destructive mb-4">{error}</p>}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Creating Account..." : "Create Provider Account"}
                            </Button>
                            <p className="text-center text-sm text-muted-foreground pt-4">
                                Already have an account? <a href="/login" className="text-primary hover:underline font-medium">Sign in here</a>
                            </p>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    </div>
  )
}

