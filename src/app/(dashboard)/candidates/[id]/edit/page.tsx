import { createClient } from "@/lib/supabase/server"
import { CandidateForm } from "@/components/candidates/candidate-form"
import { notFound } from "next/navigation"

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: candidate }, { data: cases }] = await Promise.all([
    supabase.from("candidates").select("*").eq("id", id).single(),
    supabase
      .from("cases")
      .select("clients (company_name)")
      .eq("candidate_id", id)
      .order("created_at", { ascending: false })
      .limit(1),
  ])

  if (!candidate) {
    notFound()
  }

  const latestCase = cases?.[0]
  const client = latestCase
    ? (Array.isArray(latestCase.clients) ? latestCase.clients[0] : latestCase.clients) as { company_name: string } | null
    : null

  return <CandidateForm candidate={candidate} client={client} />
}
