"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CandidatesTable } from "@/components/candidates/candidates-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface Candidate {
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
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
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
        agencies (agency_name),
        cases (
          clients (company_name)
        )
      `)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const normalized = ((data ?? []) as Record<string, unknown>[]).map((c: Record<string, unknown>) => {
          const casesArr = Array.isArray(c.cases) ? c.cases : []
          const clientArr = casesArr.map((ca: { clients: unknown }) =>
            Array.isArray(ca.clients) ? ca.clients[0] : ca.clients
          ).filter(Boolean)
          return {
            ...c,
            agencies: Array.isArray(c.agencies) ? c.agencies[0] ?? null : c.agencies,
            client: clientArr[0] as { company_name: string } | null ?? null,
          } as Candidate
        })
        setCandidates(normalized)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
  }

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
      <CandidatesTable candidates={candidates} />
    </div>
  )
}
