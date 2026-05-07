import { createClient } from "@/lib/supabase/server"
import { CandidatesTable } from "@/components/candidates/candidates-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function CandidatesPage() {
  const supabase = await createClient()

  const { data: candidates } = await supabase
    .from("candidates")
    .select(`
      id,
      full_name,
      nationality,
      passport_number,
      job_role,
      medical_status,
      current_status,
      created_at,
      agencies (agency_name)
    `)
    .order("created_at", { ascending: false })

  const normalizedCandidates = (candidates ?? []).map((c) => ({
    ...c,
    agencies: Array.isArray(c.agencies) ? c.agencies[0] ?? null : c.agencies,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage candidate profiles and documents
          </p>
        </div>
        <Link href="/candidates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        </Link>
      </div>
      <CandidatesTable candidates={normalizedCandidates} />
    </div>
  )
}
