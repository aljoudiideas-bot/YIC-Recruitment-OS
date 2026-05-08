import { createClient } from "@/lib/supabase/server"
import { CaseEditForm } from "@/components/cases/case-edit-form"
import { notFound } from "next/navigation"

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: caseData }, { data: workerTypes }, { data: intermediaries }] = await Promise.all([
    supabase
      .from("cases")
      .select(`
        *,
        candidates!inner(full_name, nationality, passport_number),
        clients!inner(company_name),
        agencies!inner(agency_name, country)
      `)
      .eq("id", id)
      .single(),
    supabase.from("worker_types").select("id, name_ar, name_en").order("name_en"),
    supabase.from("intermediaries").select("id, name").order("name"),
  ])

  if (!caseData) {
    notFound()
  }

  const normalizedCase = {
    ...caseData,
    candidates: Array.isArray(caseData.candidates) ? caseData.candidates[0] : caseData.candidates,
    clients: Array.isArray(caseData.clients) ? caseData.clients[0] : caseData.clients,
    agencies: Array.isArray(caseData.agencies) ? caseData.agencies[0] : caseData.agencies,
  }

  return <CaseEditForm caseData={normalizedCase} workerTypes={workerTypes ?? []} intermediaries={intermediaries ?? []} />
}
