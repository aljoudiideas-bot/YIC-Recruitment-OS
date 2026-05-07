"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const docTypeLabels: Record<string, string> = {
  passport: "Passport",
  visa: "Visa",
  medical_report: "Medical Report",
  contract: "Contract",
  ticket: "Ticket",
  other: "Other",
}

const statusColors: Record<string, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  pending: "warning",
  verified: "success",
  expired: "danger",
  missing: "gray",
}

interface DocumentsTableProps {
  documents: {
    id: string
    document_type: string
    file_name: string
    file_size: number | null
    file_url: string
    status: string
    expiry_date: string | null
    created_at: string
    cases: { case_number: string } | null
    profiles: { full_name: string } | null
  }[]
}

export function DocumentsTable({ documents }: DocumentsTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const filtered = documents.filter(
    (d) =>
      d.file_name.toLowerCase().includes(search.toLowerCase()) ||
      d.document_type.toLowerCase().includes(search.toLowerCase()) ||
      (d.cases?.case_number ?? "").toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this document?")) return

    setDeleting(id)
    const supabase = createClient()

    const doc = documents.find((d) => d.id === id)
    if (doc) {
      const path = doc.file_url.split("/").slice(-2).join("/")
      await supabase.storage.from("documents").remove([path])
    }

    const { error } = await supabase.from("documents").delete().eq("id", id)
    setDeleting(null)

    if (error) {
      alert("Error: " + error.message)
    } else {
      window.location.reload()
    }
  }

  function formatFileSize(bytes: number | null) {
    if (!bytes) return "—"
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search documents..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:w-80"
      />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Case</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">File</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Size</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Expiry</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Uploaded By</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((doc) => {
              const caseData = Array.isArray(doc.cases) ? doc.cases[0] : doc.cases
              const profileData = Array.isArray(doc.profiles) ? doc.profiles[0] : doc.profiles
              return (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-blue-600">
                    {caseData?.case_number ?? "—"}
                  </td>
                  <td className="px-4 py-3">{docTypeLabels[doc.document_type] ?? doc.document_type}</td>
                  <td className="px-4 py-3 text-gray-600">{doc.file_name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatFileSize(doc.file_size)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColors[doc.status] ?? "gray"}>{doc.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(doc.expiry_date)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {(profileData as { full_name: string } | undefined)?.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(doc.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        asChild
                        title="View"
                      >
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        asChild
                        title="Download"
                      >
                        <a href={doc.file_url} download={doc.file_name}>
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deleting === doc.id}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            No documents found
          </div>
        )}
      </div>
    </div>
  )
}
