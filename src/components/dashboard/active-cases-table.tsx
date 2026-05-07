"use client"

import { STAGE_LABELS, PRIORITY_COLORS, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const stageColors: Record<string, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  new_request: "info",
  documents_collection: "default",
  medical: "warning",
  visa_processing: "warning",
  ticketing: "info",
  departure: "default",
  arrival: "success",
  completed: "success",
  cancelled: "danger",
}

interface ActiveCasesTableProps {
  cases: {
    id: string
    case_number: string
    current_stage: string
    status: string
    priority: string
    expected_arrival: string | null
    created_at: string
  }[]
}

export function ActiveCasesTable({ cases }: ActiveCasesTableProps) {
  if (cases.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No active cases</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="pb-2 text-left font-medium text-gray-500">Case #</th>
            <th className="pb-2 text-left font-medium text-gray-500">Stage</th>
            <th className="pb-2 text-left font-medium text-gray-500">Priority</th>
            <th className="pb-2 text-left font-medium text-gray-500">ETA</th>
            <th className="pb-2 text-left font-medium text-gray-500">Created</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id} className="border-b last:border-0">
              <td className="py-2.5 font-medium">{c.case_number}</td>
              <td className="py-2.5">
                <Badge variant={stageColors[c.current_stage] ?? "gray"}>
                  {STAGE_LABELS[c.current_stage] ?? c.current_stage}
                </Badge>
              </td>
              <td className="py-2.5">
                <Badge variant={(PRIORITY_COLORS[c.priority] && "gray") || "gray"}>
                  {c.priority}
                </Badge>
              </td>
              <td className="py-2.5 text-gray-600">{formatDate(c.expected_arrival)}</td>
              <td className="py-2.5 text-gray-500">{formatDate(c.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
