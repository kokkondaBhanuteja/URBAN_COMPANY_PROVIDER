"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, LogOut } from "lucide-react"
import { jwtDecode } from "jwt-decode"

interface DecodedToken {
  id: string
  userType: string
  iat: number
  exp: number
  name: string
}

interface VerificationCheckProps {
  children: React.ReactNode
}

export default function VerificationCheck({ children }: VerificationCheckProps) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [providerName, setProviderName] = useState("Provider")
  const router = useRouter()

  useEffect(() => {
    const checkVerificationStatus = async () => {
      const token = localStorage.getItem("provider_token")

      if (!token) {
        router.push("/login")
        return
      }

      try {
        const decodedToken: DecodedToken = jwtDecode(token)
        setProviderName(decodedToken.name || "Provider")

        const res = await fetch("/api/provider/verification-status", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          throw new Error("Failed to check verification status")
        }

        const { isVerified } = await res.json()
        setIsVerified(isVerified)
      } catch (error) {
        console.error("Verification check failed:", error)
        localStorage.removeItem("provider_token")
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkVerificationStatus()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("provider_token")
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isVerified === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md shadow-xl rounded-xl border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Account Pending Verification</CardTitle>
            <CardDescription>
              Hello {providerName}, your account is pending Admin verification. Please wait until you are verified to
              access the provider dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="space-y-1 text-xs">
                  <li>• Our admin team will review your application</li>
                  <li>• You'll receive an email once verified</li>
                  <li>• Verification typically takes 1-2 business days</li>
                </ul>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="w-full bg-transparent">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
