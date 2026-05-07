import { createClient } from "@/lib/supabase/server"
import { CasesTable } from "@/components/cases/cases-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function CasesPage() {
  const supabase = await createClient()

  const { data: cases } = await supabase
    .from("cases")
    .select(`
      id,
      case_number,
      current_stage,
      status,
      priority,
      expected_arrival,
      created_at,
      candidates (full_name, nationality),
      clients (company_name),
      agencies (agency_name)
    `)
    .order("created_at", { ascending: false })

  const normalizedCases = (cases ?? []).map((c) => ({
    ...c,
    candidates: Array.isArray(c.candidates) ? c.candidates[0] ?? null : c.candidates,
    clients: Array.isArray(c.clients) ? c.clients[0] ?? null : c.clients,
    agencies: Array.isArray(c.agencies) ? c.agencies[0] ?? null : c.agencies,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Cases</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage end-to-end recruitment lifecycle
          </p>
        </div>
        <Link href="/cases/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </Link>
      </div>
      <CasesTable cases={normalizedCases} />
    </div>
  )
}
