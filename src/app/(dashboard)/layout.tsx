import { createClient } from "@/lib/supabase/server"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"
import { SidebarProvider } from "@/lib/sidebar-context"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "YIC Recruitment OS",
  description: "Operational Recruitment Execution System",
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    profile = data
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <AppSidebar user={profile} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header user={profile} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
