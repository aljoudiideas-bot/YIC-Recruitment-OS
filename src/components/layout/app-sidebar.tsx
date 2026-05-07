"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn, ROLE_LABELS } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Building2,
  Globe,
  FileText,
  DollarSign,
  CheckSquare,
  Settings,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Cases", href: "/cases", icon: FolderKanban },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Clients", href: "/clients", icon: Building2 },
  { name: "Agencies", href: "/agencies", icon: Globe },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface AppSidebarProps {
  user: { fullName: string; role: string } | null
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 items-center border-b border-slate-700 px-6">
        <h1 className="text-lg font-bold tracking-tight">YIC Recruitment</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      {user && (
        <div className="border-t border-slate-700 px-4 py-3">
          <p className="truncate text-sm font-medium text-slate-200">{user.fullName}</p>
          <p className="truncate text-xs text-slate-400">
            {ROLE_LABELS[user.role] ?? user.role}
          </p>
        </div>
      )}
    </aside>
  )
}
