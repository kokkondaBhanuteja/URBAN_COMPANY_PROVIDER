"use client"

import type React from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Bell, User, HelpCircle, BarChart3, Calendar, CreditCard, Star, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { jwtDecode } from "jwt-decode"
import VerificationCheck from "./VerificationCheck"

interface DecodedToken {
  id: string
  userType: string
  iat: number
  exp: number
  name: string
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/dashboard" },
  { id: "bookings", label: "My Bookings", icon: Calendar, href: "/bookings" },
  { id: "earnings", label: "Earnings", icon: CreditCard, href: "/earnings" },
  { id: "reviews", label: "Reviews", icon: Star, href: "/reviews" },
  { id: "support", label: "Support", icon: HelpCircle, href: "/support" },
];

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const [providerName, setProviderName] = useState("Provider")
  const [isAvailable, setIsAvailable] = useState(true)

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("provider_token")
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token)
        setProviderName(decodedToken.name || "Provider")
      } catch (error) {
        console.error("Invalid token:", error)
        handleLogout()
      }
    }
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push("/login")
  }

  return (
    <VerificationCheck>
      <div className="flex min-h-screen bg-gray-50/50">
        {/* Sidebar */}
        <aside className="w-64 bg-background text-foreground p-4 flex-col hidden sm:flex border-r">
          <div className="border-b px-2 pb-3">
             <h2 className="text-lg font-semibold">ServicePro</h2>
          </div>
          <nav className="mt-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 block py-2.5 px-4 rounded-md transition duration-200 ${
                        isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-muted/50"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 sticky top-0 z-30">
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="availability-toggle" checked={isAvailable} onCheckedChange={setIsAvailable} />
                <Label htmlFor="availability-toggle">{isAvailable ? "Available" : "Unavailable"}</Label>
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent h-9">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>
                        {providerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{providerName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" /> Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </VerificationCheck>
  )
}