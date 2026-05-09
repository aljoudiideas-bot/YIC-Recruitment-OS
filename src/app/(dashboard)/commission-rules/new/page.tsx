import { createClient } from "@/lib/supabase/server"
import { CommissionRuleForm } from "@/components/commission-rules/commission-rule-form"

export default async function NewCommissionRulePage() {
  const supabase = await createClient()

  const [{ data: workerTypes }, { data: agencies }, { data: clients }, { data: intermediaries }] = await Promise.all([
    supabase.from("worker_types").select("id, name_en, name_ar").order("name_en"),
    supabase.from("agencies").select("id, agency_name").eq("status", "active").order("agency_name"),
    supabase.from("clients").select("id, company_name").eq("status", "active").order("company_name"),
    supabase.from("intermediaries").select("id, name").order("name"),
  ])

  return (
    <CommissionRuleForm
      workerTypes={workerTypes ?? []}
      agencies={agencies ?? []}
      clients={clients ?? []}
      intermediaries={intermediaries ?? []}
    />
  )
}
