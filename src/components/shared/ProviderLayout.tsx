"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell, User, Settings, HelpCircle, BarChart3, Calendar, CreditCard,
  Star, Moon, Sun, LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
  SidebarInset, SidebarHeader,
} from '@/components/ui/sidebar';
import { jwtDecode } from "jwt-decode";


interface DecodedToken {
  id: string;
  userType: string;
  iat: number;
  exp: number;
  name: string;
}

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [providerName, setProviderName] = useState("Provider");

  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("provider_token");
    if (!token) {
      router.push('/login');
    } else {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        setProviderName(decodedToken.name || "Provider");
      } catch (error) {
        console.error("Invalid token:", error);
        router.push('/login');
      }
    }
  }, [router]);

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, href: "/dashboard" },
    { id: "bookings", label: "My Bookings", icon: Calendar, href: "/bookings" },
    { id: "earnings", label: "Earnings", icon: CreditCard, href: "/earnings" },
    { id: "reviews", label: "Reviews", icon: Star, href: "/reviews" },
    { id: "support", label: "Support", icon: HelpCircle, href: "/support" },
  ];

  useEffect(() => {
    const currentItem = sidebarItems.find(item => pathname.startsWith(item.href));
    if (currentItem) {
      setActiveSection(currentItem.id);
    }
  }, [pathname, sidebarItems]);

  const handleNavigation = (href: string, id: string) => {
    setActiveSection(id);
    router.push(href);
  };

  const handleLogout = () => {
    localStorage.removeItem('provider_token');
    router.push('/login');
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full bg-background">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">ServicePro</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
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
                    );
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
              <Button variant="outline" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                <Sun className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>
                        {providerName.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{providerName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleNavigation('/profile', 'profile')}>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Manage</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}