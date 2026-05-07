import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload } from "lucide-react"
import { DocumentsTable } from "@/components/documents/documents-table"
import Link from "next/link"

export default async function DocumentsPage() {
  const supabase = await createClient()

  const { data: documents } = await supabase
    .from("documents")
    .select(`
      id,
      document_type,
      file_name,
      file_size,
      file_url,
      status,
      expiry_date,
      created_at,
      cases (case_number),
      profiles:uploaded_by (full_name)
    `)
    .order("created_at", { ascending: false })

  const docList = documents ?? []
  const pending = docList.filter((d) => d.status === "pending" || d.status === "missing").length

  const normalizedDocs = docList.map((d) => ({
    ...d,
    cases: Array.isArray(d.cases) ? d.cases[0] ?? null : d.cases,
    profiles: Array.isArray(d.profiles) ? d.profiles[0] ?? null : d.profiles,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage recruitment documents
          </p>
        </div>
        <Button asChild>
          <Link href="/documents/new">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Link>
        </Button>
      </div>

      {pending > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {pending} document(s) pending or missing attention
        </div>
      )}

      <DocumentsTable documents={normalizedDocs} />
    </div>
  )
}
