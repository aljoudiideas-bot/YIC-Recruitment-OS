import { createClient } from "@/lib/supabase/server"
import { NewCaseForm } from "@/components/cases/new-case-form"
import { getServerT } from "@/lib/i18n/server"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewCasePage() {
  const t = await getServerT()
  const supabase = await createClient()

  const [{ data: candidates }, { data: clients }, { data: agencies }, { data: workerTypes }, { data: intermediaries }] = await Promise.all([
    supabase.from("candidates").select("id, full_name, nationality, job_role").order("full_name"),
    supabase.from("clients").select("id, company_name").eq("status", "active").order("company_name"),
    supabase.from("agencies").select("id, agency_name, country").eq("status", "active").order("agency_name"),
    supabase.from("worker_types").select("id, name_ar, name_en").order("name_en"),
    supabase.from("intermediaries").select("id, name").order("name"),
  ])

  return (
    <div className="space-y-6">
      <div>
        <Link href="/cases" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')} {t('cases.title')}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{t('cases.createNew')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('cases.createSubtitle')}</p>
      </div>
      <div className="mx-auto max-w-2xl">
        <NewCaseForm
          candidates={candidates ?? []}
          clients={clients ?? []}
          agencies={agencies ?? []}
          workerTypes={workerTypes ?? []}
          intermediaries={intermediaries ?? []}
        />
      </div>
    </div>
  )
}
