import type React from "react"
import ProviderLayout from "@/components/shared/ProviderLayout"
import QueryProvider from "@/components/shared/QueryProvider"
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
        <ProviderLayout>{children}</ProviderLayout>
    </QueryProvider>
  )
}
