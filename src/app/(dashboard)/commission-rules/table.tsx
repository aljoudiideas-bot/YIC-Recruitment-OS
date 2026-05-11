"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { CommissionRulesClient } from "./client"

interface RuleRaw {
  id: string
  agency_pays_us: number
  client_pays_us: number
  intermediary_fee: number
  worker_types: { name_en: string; name_ar: string }[]
  agencies: { agency_name: string }[]
  clients: { company_name: string }[]
  intermediaries: { name: string }[]
}

interface Rule {
  id: string
  agency_pays_us: number
  client_pays_us: number
  intermediary_fee: number
  worker_types: { name_en: string; name_ar: string } | null
  agencies: { agency_name: string } | null
  clients: { company_name: string } | null
  intermediaries: { name: string } | null
}

function pick<T>(arr: T[] | null): T | null {
  return Array.isArray(arr) && arr.length > 0 ? (arr[0] ?? null) : null
}

export function CommissionRulesTable() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
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
      .then(({ data }) => {
        const raw = (data ?? []) as RuleRaw[]
        setRules(raw.map(r => ({
          id: r.id,
          agency_pays_us: r.agency_pays_us,
          client_pays_us: r.client_pays_us,
          intermediary_fee: r.intermediary_fee,
          worker_types: pick(r.worker_types),
          agencies: pick(r.agencies),
          clients: pick(r.clients),
          intermediaries: pick(r.intermediaries),
        })))
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
  }

  return (
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
            {rules.map((r) => {
              const apu = Number(r.agency_pays_us)
              const cpu = Number(r.client_pays_us)
              const fee = Number(r.intermediary_fee)
              const total = apu + cpu - fee
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.worker_types?.name_en ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{r.agencies?.agency_name ?? "Any"}</td>
                  <td className="px-4 py-3 text-gray-600">{r.clients?.company_name ?? "Any"}</td>
                  <td className="px-4 py-3 text-gray-600">{r.intermediaries?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatCurrency(apu)}</td>
                  <td className="px-4 py-3 text-right text-blue-600 font-medium">{formatCurrency(cpu)}</td>
                  <td className="px-4 py-3 text-right text-orange-600 font-medium">{formatCurrency(fee)}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatCurrency(total)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                        <Link href={`/commission-rules/${r.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <CommissionRulesClient ruleId={r.id} />
                    </div>
                  </td>
                </tr>
              )
            })}
            {rules.length === 0 && (
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
  )
}
