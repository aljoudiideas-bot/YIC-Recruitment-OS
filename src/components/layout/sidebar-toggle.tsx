"use client"

import { useSidebar } from "@/lib/sidebar-context"
import { Menu } from "lucide-react"

export function SidebarToggle() {
  const { toggle } = useSidebar()
  return (
    <button
      onClick={toggle}
      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
      aria-label="Toggle sidebar"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}
