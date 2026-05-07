import { createClient } from "@/lib/supabase/server"
import { CandidateForm } from "@/components/candidates/candidate-form"
import { notFound } from "next/navigation"

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: candidate } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .single()

  if (!candidate) {
    notFound()
  }

  return <CandidateForm candidate={candidate} />
}
