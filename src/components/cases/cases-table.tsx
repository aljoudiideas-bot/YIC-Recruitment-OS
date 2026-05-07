"use client"

import { useState } from "react"
import { STAGE_LABELS, STAGE_COLORS, PRIORITY_COLORS, formatDate, cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import Link from "next/link"

const stageBadgeVariant: Record<string, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
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

interface CasesTableProps {
  cases: {
    id: string
    case_number: string
    current_stage: string
    status: string
    priority: string
    expected_arrival: string | null
    created_at: string
    candidates: { full_name: string; nationality: string } | null
    clients: { company_name: string } | null
    agencies: { agency_name: string } | null
  }[]
}

const STAGES = [
  "new_request",
  "documents_collection",
  "medical",
  "visa_processing",
  "ticketing",
  "departure",
  "arrival",
  "completed",
]

export function CasesTable({ cases }: CasesTableProps) {
  const [stageFilter, setStageFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = cases.filter((c) => {
    if (stageFilter !== "all" && c.current_stage !== stageFilter) return false
    if (statusFilter !== "all" && c.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Stages</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="ml-auto self-center text-sm text-gray-500">
          {filtered.length} of {cases.length} cases
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Case #</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Candidate</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Client</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Agency</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Stage</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Priority</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">ETA</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-blue-600">{c.case_number}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{c.candidates?.full_name ?? "—"}</p>
                    <p className="text-xs text-gray-500">{c.candidates?.nationality}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{c.clients?.company_name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-700">{c.agencies?.agency_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", STAGE_COLORS[c.current_stage])}>
                    {STAGE_LABELS[c.current_stage]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", PRIORITY_COLORS[c.priority])}>
                    {c.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{formatDate(c.expected_arrival)}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                    <Link href={`/cases/${c.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            No cases found matching your filters
          </div>
        )}
      </div>
    </div>
  )
}


