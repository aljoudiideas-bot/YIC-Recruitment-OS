import { createClient } from "@/lib/supabase/server"
import { AgencyForm } from "@/components/agencies/agency-form"
import { notFound } from "next/navigation"

export default async function EditAgencyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: agency } = await supabase
    .from("agencies")
    .select("*")
    .eq("id", id)
    .single()

  if (!agency) {
    notFound()
  }

  return <AgencyForm agency={agency} />
}
