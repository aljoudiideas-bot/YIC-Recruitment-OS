import { createClient } from "@/lib/supabase/server"
import { CommissionRuleForm } from "@/components/commission-rules/commission-rule-form"
import { notFound } from "next/navigation"

export default async function EditCommissionRulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: rule }, { data: workerTypes }, { data: agencies }, { data: clients }, { data: intermediaries }] = await Promise.all([
    supabase.from("commission_rules").select("*").eq("id", id).single(),
    supabase.from("worker_types").select("id, name_en, name_ar").order("name_en"),
    supabase.from("agencies").select("id, agency_name").eq("status", "active").order("agency_name"),
    supabase.from("clients").select("id, company_name").eq("status", "active").order("company_name"),
    supabase.from("intermediaries").select("id, name").order("name"),
  ])

  if (!rule) notFound()

  return (
    <CommissionRuleForm
      rule={rule}
      workerTypes={workerTypes ?? []}
      agencies={agencies ?? []}
      clients={clients ?? []}
      intermediaries={intermediaries ?? []}
    />
  )
}
