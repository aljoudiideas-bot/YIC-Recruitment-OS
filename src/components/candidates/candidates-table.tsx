"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Pencil } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

const medicalColors: Record<string, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  pending: "warning",
  passed: "success",
  failed: "danger",
  not_started: "gray",
}

const statusColors: Record<string, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  new: "info",
  in_process: "default",
  deployed: "success",
  cancelled: "danger",
}

interface CandidatesTableProps {
  candidates: {
    id: string
    full_name: string
    nationality: string
    passport_number: string
    job_role: string
    medical_status: string
    current_status: string
    created_at: string
    agencies: { agency_name: string } | null
    client: { company_name: string } | null
  }[]
}

export function CandidatesTable({ candidates }: CandidatesTableProps) {
  const [search, setSearch] = useState("")

  const filtered = candidates.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.passport_number.toLowerCase().includes(search.toLowerCase()) ||
    c.nationality.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search by name, passport, or nationality..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:w-80"
      />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Nationality</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Passport</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Job Role</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Client</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Agency</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Medical</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Created</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{c.nationality}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.passport_number}</td>
                <td className="px-4 py-3 text-gray-700">{c.job_role}</td>
                <td className="px-4 py-3 text-gray-600">{c.client?.company_name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{c.agencies?.agency_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={medicalColors[c.medical_status] ?? "gray"}>
                    {c.medical_status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusColors[c.current_status] ?? "gray"}>
                    {c.current_status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(c.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                      <Link href={`/candidates/${c.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            No candidates found
          </div>
        )}
      </div>
    </div>
  )
}
