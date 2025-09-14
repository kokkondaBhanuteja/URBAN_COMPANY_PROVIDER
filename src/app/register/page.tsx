"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Eye, EyeOff, User, Mail, Phone, MapPin, FileText, Briefcase, Home } from "lucide-react"
import Loader from "../../components/shared/Loader"

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
    servicesOffered: [] as string[],
    // --- START: ADD ADDRESS STATE ---
    address: {
        addressLine1: "",
        city: "",
        pincode: "",
        state: "",
    },
    // --- END: ADD ADDRESS STATE ---
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
    const { name, value } = e.target;
    // --- START: HANDLE NESTED ADDRESS STATE ---
    if (name in formData.address) {
        setFormData((prev) => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value,
            },
        }));
    } else {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }
    // --- END: HANDLE NESTED ADDRESS STATE ---
  }

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
    // --- START: ADD ADDRESS VALIDATION ---
    if (!formData.address.addressLine1.trim()) return "Address is required";
    if (!formData.address.city.trim()) return "City is required";
    if (!formData.address.pincode.trim()) return "Pincode is required";
    if (!formData.address.state.trim()) return "State is required";
    // --- END: ADD ADDRESS VALIDATION ---


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
        userType: "provider" as const,
        bio: formData.bio.trim(),
        serviceableLocations: formData.serviceableLocations
          .split(",")
          .map((loc) => loc.trim())
          .filter((loc) => loc),
        servicesOffered: formData.servicesOffered,
        address: { // <-- Pass the address object
            ...formData.address,
            country: "India", // Default country
            addressType: "work" as const, // Default type for providers
        },
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
        <Card className="w-full max-w-4xl shadow-xl rounded-xl border">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-foreground">Join as a Service Provider</CardTitle>
                <CardDescription>Create your provider account to start connecting with customers.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="py-8"><Loader /></div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">

                        {/* Column 1: Personal Info */}
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

                        {/* Column 2: Service Info */}
                        <div className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="servicesOffered" className="flex items-center gap-2"><Briefcase className="h-4 w-4" />Services Offered</Label>
                                <div className="p-2 border rounded-md h-28 overflow-y-auto">
                                {availableServices.map((service) => (
                                    <div key={service._id} className="flex items-center gap-2 p-1">
                                    <input
                                        type="checkbox"
                                        id={service._id}
                                        checked={formData.servicesOffered.includes(service._id)}
                                        onChange={() => handleMultiSelectChange(service._id)}
                                    />
                                    <label htmlFor={service._id}>{service.serviceName}</label>
                                    </div>
                                ))}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="serviceableLocations" className="flex items-center gap-2"><MapPin className="h-4 w-4" />Serviceable Locations</Label>
                                <Input id="serviceableLocations" name="serviceableLocations" type="text" value={formData.serviceableLocations} onChange={handleInputChange} placeholder="e.g., New York, Los Angeles" required />
                                <p className="text-xs text-muted-foreground">Enter city names separated by commas.</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio" className="flex items-center gap-2"><FileText className="h-4 w-4" />Bio (Optional)</Label>
                                <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us about your experience..." rows={2} />
                            </div>
                        </div>

                        {/* --- START: ADD ADDRESS FIELDS --- */}
                        <div className="md:col-span-2 pt-4 border-t">
                             <Label className="flex items-center gap-2 mb-2 font-medium"><Home className="h-4 w-4" />Business Address</Label>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="addressLine1">Address Line</Label>
                                    <Input id="addressLine1" name="addressLine1" type="text" value={formData.address.addressLine1} onChange={handleInputChange} placeholder="e.g., 123 Main St" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" name="city" type="text" value={formData.address.city} onChange={handleInputChange} placeholder="e.g., Hanamkonda" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" name="state" type="text" value={formData.address.state} onChange={handleInputChange} placeholder="e.g., Telangana" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pincode">Pincode</Label>
                                    <Input id="pincode" name="pincode" type="text" value={formData.address.pincode} onChange={handleInputChange} placeholder="e.g., 506001" required />
                                </div>
                            </div>
                        </div>
                        {/* --- END: ADD ADDRESS FIELDS --- */}

                        {/* Footer (spanning both columns) */}
                        <div className="md:col-span-2 pt-4">
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