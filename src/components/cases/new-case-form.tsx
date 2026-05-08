"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface NewCaseFormProps {
  candidates: { id: string; full_name: string; nationality: string; job_role: string }[]
  clients: { id: string; company_name: string }[]
  agencies: { id: string; agency_name: string; country: string }[]
  workerTypes: { id: string; name_ar: string; name_en: string }[]
  intermediaries: { id: string; name: string }[]
}

const STAGES = [
  { value: "new_request", label: "New Request" },
  { value: "documents_collection", label: "Documents Collection" },
  { value: "medical", label: "Medical" },
  { value: "visa_processing", label: "Visa Processing" },
  { value: "ticketing", label: "Ticketing" },
  { value: "departure", label: "Departure" },
  { value: "arrival", label: "Arrival" },
]

export function NewCaseForm({ candidates, clients, agencies, workerTypes, intermediaries }: NewCaseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedWorkerType, setSelectedWorkerType] = useState("")
  const [selectedAgency, setSelectedAgency] = useState("")
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedIntermediary, setSelectedIntermediary] = useState("")
  const [commission, setCommission] = useState<{
    agency_pays_us: number
    client_pays_us: number
    intermediary_fee: number
  } | null>(null)

  async function fetchCommission(workerTypeId: string, agencyId: string, clientId: string, intermediaryId: string) {
    if (!workerTypeId || !agencyId || !clientId) { setCommission(null); return }
    const supabase = createClient()
    const { data } = await supabase
      .from("commission_rules")
      .select("agency_pays_us, client_pays_us, intermediary_fee")
      .eq("worker_type_id", workerTypeId)
      .eq("external_agency_id", agencyId)
      .eq("saudi_client_id", clientId)
      .eq("intermediary_id", intermediaryId || "00000000-0000-0000-0000-000000000000")
      .maybeSingle()
    setCommission(data ?? null)
  }

  function handleWorkerTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    setSelectedWorkerType(v)
    fetchCommission(v, selectedAgency, selectedClient, selectedIntermediary)
  }

  function handleAgencyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    setSelectedAgency(v)
    fetchCommission(selectedWorkerType, v, selectedClient, selectedIntermediary)
  }

  function handleClientChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    setSelectedClient(v)
    fetchCommission(selectedWorkerType, selectedAgency, v, selectedIntermediary)
  }

  function handleIntermediaryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    setSelectedIntermediary(v)
    if (v) fetchCommission(selectedWorkerType, selectedAgency, selectedClient, v)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const formData = new FormData(form)

    const supabase = createClient()

    const { error: insertError } = await supabase.from("cases").insert({
      candidate_id: formData.get("candidate_id"),
      client_id: formData.get("client_id"),
      agency_id: formData.get("agency_id"),
      current_stage: formData.get("current_stage") || "new_request",
      priority: formData.get("priority") || "normal",
      expected_arrival: formData.get("expected_arrival") || null,
      status: "active",
      notes: formData.get("notes") || null,
      worker_type_id: formData.get("worker_type_id") || null,
      intermediary_id: formData.get("intermediary_id") || null,
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push("/cases")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Candidate</label>
        <select
          name="candidate_id"
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select candidate</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name} — {c.nationality} ({c.job_role})
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Client</label>
          <select
            name="client_id"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.company_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Agency</label>
          <select
            name="agency_id"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select agency</option>
            {agencies.map((a) => (
              <option key={a.id} value={a.id}>{a.agency_name} ({a.country})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-700">Commission Info</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Worker Type</label>
            <select
              name="worker_type_id"
              value={selectedWorkerType}
              onChange={handleWorkerTypeChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              {workerTypes.map((wt) => (
                <option key={wt.id} value={wt.id}>{wt.name_en} ({wt.name_ar})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Intermediary</label>
            <select
              name="intermediary_id"
              value={selectedIntermediary}
              onChange={handleIntermediaryChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">None</option>
              {intermediaries.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>
        {commission && (
          <div className="mt-3 grid gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-3">
            <div>
              <span className="text-xs text-gray-500">Agency Pays Us</span>
              <p className="text-sm font-semibold text-emerald-600">${commission.agency_pays_us}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Client Pays Us</span>
              <p className="text-sm font-semibold text-blue-600">${commission.client_pays_us}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Intermediary Fee</span>
              <p className="text-sm font-semibold text-orange-600">${commission.intermediary_fee}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Stage</label>
          <select
            name="current_stage"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select
            name="priority"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="low">Low</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Expected Arrival</label>
        <input
          type="date"
          name="expected_arrival"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          rows={3}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Case"}
        </Button>
      </div>
    </form>
  )
}
