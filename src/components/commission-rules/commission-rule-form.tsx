"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface CommissionRuleFormProps {
  rule?: {
    id: string
    worker_type_id: string
    external_agency_id: string | null
    saudi_client_id: string | null
    intermediary_id: string | null
    agency_pays_us: number
    client_pays_us: number
    intermediary_fee: number
  }
  workerTypes: { id: string; name_en: string; name_ar: string }[]
  agencies: { id: string; agency_name: string }[]
  clients: { id: string; company_name: string }[]
  intermediaries: { id: string; name: string }[]
}

export function CommissionRuleForm({ rule, workerTypes, agencies, clients, intermediaries }: CommissionRuleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const payload = {
      worker_type_id: formData.get("worker_type_id"),
      external_agency_id: (formData.get("external_agency_id") as string) || null,
      saudi_client_id: (formData.get("saudi_client_id") as string) || null,
      intermediary_id: (formData.get("intermediary_id") as string) || null,
      agency_pays_us: parseFloat(formData.get("agency_pays_us") as string) || 0,
      client_pays_us: parseFloat(formData.get("client_pays_us") as string) || 0,
      intermediary_fee: parseFloat(formData.get("intermediary_fee") as string) || 0,
    }

    const { error } = rule
      ? await supabase.from("commission_rules").update(payload).eq("id", rule.id)
      : await supabase.from("commission_rules").insert(payload)

    setLoading(false)

    if (error) {
      alert("Error: " + error.message)
    } else {
      router.push("/commission-rules")
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{rule ? "Edit Commission Rule" : "New Commission Rule"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Worker Type *</label>
          <select name="worker_type_id" required defaultValue={rule?.worker_type_id ?? ""} className="w-full border p-2 rounded">
            <option value="">Select worker type</option>
            {workerTypes.map((wt) => (
              <option key={wt.id} value={wt.id}>{wt.name_en} ({wt.name_ar})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Agency (Optional)</label>
            <select name="external_agency_id" defaultValue={rule?.external_agency_id ?? ""} className="w-full border p-2 rounded">
              <option value="">Any agency</option>
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>{a.agency_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Client (Optional)</label>
            <select name="saudi_client_id" defaultValue={rule?.saudi_client_id ?? ""} className="w-full border p-2 rounded">
              <option value="">Any client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.company_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Intermediary (Optional)</label>
          <select name="intermediary_id" defaultValue={rule?.intermediary_id ?? ""} className="w-full border p-2 rounded">
            <option value="">None</option>
            {intermediaries.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Agency Pays Us ($)</label>
            <input
              name="agency_pays_us"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={rule?.agency_pays_us ?? ""}
              className="w-full border p-2 rounded"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Client Pays Us ($)</label>
            <input
              name="client_pays_us"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={rule?.client_pays_us ?? ""}
              className="w-full border p-2 rounded"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Intermediary Fee ($)</label>
            <input
              name="intermediary_fee"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={rule?.intermediary_fee ?? ""}
              className="w-full border p-2 rounded"
              placeholder="0"
            />
          </div>
        </div>

        {!rule && (
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
            Net profit per case = Agency Pays Us + Client Pays Us − Intermediary Fee.
            Configure rules before creating cases to enable auto-generated financial transactions.
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : rule ? "Update Rule" : "Create Rule"}
          </Button>
        </div>
      </form>
    </div>
  )
}
