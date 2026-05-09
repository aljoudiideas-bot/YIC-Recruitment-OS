import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { CommissionRulesClient } from "./client"

export default async function CommissionRulesPage() {
  const supabase = await createClient()

  const { data: rules } = await supabase
    .from("commission_rules")
    .select(`
      id,
      agency_pays_us,
      client_pays_us,
      intermediary_fee,
      worker_types (name_en, name_ar),
      agencies (agency_name),
      clients (company_name),
      intermediaries (name)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Rules</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure commission rules per worker type, agency, and client combination
          </p>
        </div>
        <Button asChild>
          <Link href="/commission-rules/new">
            <Plus className="mr-2 h-4 w-4" />
            New Rule
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-500">Worker Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Agency</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Intermediary</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Agency Pays Us</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Client Pays Us</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Fee</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(rules ?? []).map((r: Record<string, unknown>) => {
                const wt = r.worker_types as { name_en: string; name_ar: string } | null
                const agency = r.agencies as { agency_name: string } | null
                const client = r.clients as { company_name: string } | null
                const intermediary = r.intermediaries as { name: string } | null
                const apu = Number(r.agency_pays_us)
                const cpu = Number(r.client_pays_us)
                const fee = Number(r.intermediary_fee)
                const total = apu + cpu - fee
                return (
                  <tr key={r.id as string} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{wt?.name_en ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{agency?.agency_name ?? "Any"}</td>
                    <td className="px-4 py-3 text-gray-600">{client?.company_name ?? "Any"}</td>
                    <td className="px-4 py-3 text-gray-600">{intermediary?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatCurrency(apu)}</td>
                    <td className="px-4 py-3 text-right text-blue-600 font-medium">{formatCurrency(cpu)}</td>
                    <td className="px-4 py-3 text-right text-orange-600 font-medium">{formatCurrency(fee)}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(total)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                          <Link href={`/commission-rules/${r.id as string}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <CommissionRulesClient ruleId={r.id as string} />
                      </div>
                    </td>
                  </tr>
                )
              })}
              {(rules ?? []).length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-500">
                    No commission rules configured yet. Create your first rule to enable auto-calculations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
