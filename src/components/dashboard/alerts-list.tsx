"use client"

import { AlertTriangle, FileX, DollarSign, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const iconMap: Record<string, typeof AlertTriangle> = {
  visa_delay: AlertTriangle,
  missing_document: FileX,
  payment_overdue: DollarSign,
  stage_change: ArrowRight,
  task_due: AlertTriangle,
  general: AlertTriangle,
}

const colorMap: Record<string, string> = {
  visa_delay: "border-l-red-500",
  missing_document: "border-l-amber-500",
  payment_overdue: "border-l-red-500",
  stage_change: "border-l-blue-500",
  task_due: "border-l-amber-500",
  general: "border-l-gray-500",
}

interface AlertsListProps {
  alerts: {
    id: string
    type: string
    title: string
    message: string
    created_at: string
  }[]
}

export function AlertsList({ alerts }: AlertsListProps) {
  if (alerts.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No alerts</p>
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const Icon = iconMap[alert.type] ?? AlertTriangle
        const borderClass = colorMap[alert.type] ?? "border-l-gray-500"
        return (
          <div
            key={alert.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border-l-4 bg-white p-3 shadow-sm",
              borderClass
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{alert.title}</p>
              <p className="mt-0.5 truncate text-xs text-gray-500">{alert.message}</p>
              <p className="mt-1 text-[10px] text-gray-400">
                {new Date(alert.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
