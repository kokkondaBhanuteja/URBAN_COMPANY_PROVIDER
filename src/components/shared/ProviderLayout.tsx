"use client"

import type React from "react"

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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { jwtDecode } from "jwt-decode"
import VerificationCheck from "./VerificationCheck"

interface DecodedToken {
  id: string
  userType: string
  iat: number
  exp: number
  name: string
}

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [providerName, setProviderName] = useState("Provider")

  const router = useRouter()
  const pathname = usePathname()

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/dashboard" },
    { id: "bookings", label: "My Bookings", icon: Calendar, href: "/bookings" },
    { id: "earnings", label: "Earnings", icon: CreditCard, href: "/earnings" },
    { id: "reviews", label: "Reviews", icon: Star, href: "/reviews" },
    { id: "support", label: "Support", icon: HelpCircle, href: "/support" },
  ]


  useEffect(() => {
    const currentItem = sidebarItems.find((item) => pathname.startsWith(item.href))
    if (currentItem) {
      setActiveSection(currentItem.id)
    }
  }, [pathname])

  const handleNavigation = (href: string, id: string) => {
    setActiveSection(id)
    router.push(href)
  }

  const handleLogout = async () => { 
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push("/login")
  }

  return (
    <VerificationCheck>
      <SidebarProvider defaultOpen={true} className="h-screen bg-background">
        <Sidebar collapsible="none">
          <SidebarHeader className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">ServicePro</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={activeSection === item.id}
                          onClick={() => handleNavigation(item.href, item.id)}
                          className="w-full"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
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
                  <DropdownMenuItem onClick={() => handleNavigation("/profile", "profile")}>
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
        </SidebarInset>
      </SidebarProvider>
    </VerificationCheck>
  )
}
