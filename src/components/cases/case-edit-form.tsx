"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Circle, AlertCircle } from "lucide-react"

const STAGES = [
  { value: "new_request", label: "New Request" },
  { value: "documents_collection", label: "Documents" },
  { value: "medical", label: "Medical" },
  { value: "visa_processing", label: "Visa Processing" },
  { value: "ticketing", label: "Ticketing" },
  { value: "departure", label: "Departure" },
  { value: "arrival", label: "Arrival" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

const STAGE_COLORS: Record<string, string> = {
  new_request: "bg-blue-500",
  documents_collection: "bg-purple-500",
  medical: "bg-amber-500",
  visa_processing: "bg-orange-500",
  ticketing: "bg-indigo-500",
  departure: "bg-cyan-500",
  arrival: "bg-green-500",
  completed: "bg-emerald-600",
  cancelled: "bg-red-500",
}

interface CaseEditFormProps {
  caseData: {
    id: string
    case_number: string
    current_stage: string
    status: string
    priority: string
    expected_arrival: string | null
    actual_arrival: string | null
    notes: string | null
    worker_type_id: string | null
    intermediary_id: string | null
    client_id: string | null
    agency_id: string | null
    candidates: { full_name: string; nationality: string; passport_number: string } | null
    clients: { company_name: string } | null
    agencies: { agency_name: string; country: string } | null
  }
  workerTypes: { id: string; name_ar: string; name_en: string }[]
  intermediaries: { id: string; name: string }[]
}

export function CaseEditForm({ caseData, workerTypes, intermediaries }: CaseEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState(caseData.current_stage)
  const [status, setStatus] = useState(caseData.status)
  const [workerTypeId, setWorkerTypeId] = useState(caseData.worker_type_id ?? "")
  const [intermediaryId, setIntermediaryId] = useState(caseData.intermediary_id ?? "")
  const [commission, setCommission] = useState<{
    agency_pays_us: number
    client_pays_us: number
    intermediary_fee: number
  } | null>(null)

  useEffect(() => {
    if (workerTypeId && caseData.client_id && caseData.agency_id) {
      fetchCommission(workerTypeId, intermediaryId, caseData.client_id, caseData.agency_id)
    }
  }, [workerTypeId, intermediaryId])

  async function fetchCommission(wtId: string, intId: string, clientId: string, agencyId: string) {
    if (!wtId || !clientId || !agencyId) { setCommission(null); return }
    const supabase = createClient()
    const { data } = await supabase
      .from("commission_rules")
      .select("agency_pays_us, client_pays_us, intermediary_fee")
      .eq("worker_type_id", wtId)
      .eq("external_agency_id", agencyId)
      .eq("saudi_client_id", clientId)
      .eq("intermediary_id", intId || "00000000-0000-0000-0000-000000000000")
      .maybeSingle()
    setCommission(data ?? null)
  }

  const currentIndex = STAGES.findIndex((s) => s.value === stage)

  async function handleStageChange(newStage: string) {
    if (newStage === stage) return
    setStage(newStage)
    if (newStage === "cancelled") {
      setStatus("cancelled")
    } else if (newStage === "completed") {
      setStatus("completed")
    } else if (status === "cancelled" || status === "completed") {
      setStatus("active")
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const payload = {
      current_stage: stage,
      status,
      priority: formData.get("priority"),
      expected_arrival: (formData.get("expected_arrival") as string) || null,
      actual_arrival: (formData.get("actual_arrival") as string) || null,
      notes: formData.get("notes") || null,
      worker_type_id: workerTypeId || null,
      intermediary_id: intermediaryId || null,
    }

    const { error } = await supabase.from("cases").update(payload).eq("id", caseData.id)

    if (error) {
      alert("Error: " + error.message)
      setLoading(false)
      return
    }

    // Delete old auto-generated transactions for this case
    await supabase
      .from("financial_transactions")
      .delete()
      .eq("case_id", caseData.id)
      .ilike("description", "Auto:%")

    // Create new auto-generated transactions based on current commission
    if (commission) {
      const today = new Date().toISOString().split("T")[0]
      const autoTransactions = []
      if (commission.client_pays_us > 0) {
        autoTransactions.push({
          case_id: caseData.id,
          transaction_type: "client_payment",
          amount: commission.client_pays_us,
          currency: "USD",
          description: `Auto: Client payment - ${caseData.case_number}`,
          transaction_date: today,
        })
      }
      if (commission.agency_pays_us > 0) {
        autoTransactions.push({
          case_id: caseData.id,
          transaction_type: "client_payment",
          amount: commission.agency_pays_us,
          currency: "USD",
          description: `Auto: Agency payment - ${caseData.case_number}`,
          transaction_date: today,
        })
      }
      if (commission.intermediary_fee > 0) {
        autoTransactions.push({
          case_id: caseData.id,
          transaction_type: "operational_cost",
          amount: commission.intermediary_fee,
          currency: "USD",
          description: `Auto: Intermediary fee - ${caseData.case_number}`,
          transaction_date: today,
        })
      }
      if (autoTransactions.length > 0) {
        await supabase.from("financial_transactions").insert(autoTransactions)
      }
    }

    setLoading(false)
    router.push("/cases")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Case</h1>
          <p className="text-sm text-gray-500">{caseData.case_number}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Case Details</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Candidate:</span>
            <p className="font-medium">{caseData.candidates?.full_name} ({caseData.candidates?.nationality})</p>
          </div>
          <div>
            <span className="text-gray-500">Client:</span>
            <p className="font-medium">{caseData.clients?.company_name}</p>
          </div>
          <div>
            <span className="text-gray-500">Agency:</span>
            <p className="font-medium">{caseData.agencies?.agency_name} ({caseData.agencies?.country})</p>
          </div>
          <div>
            <span className="text-gray-500">Passport:</span>
            <p className="font-mono text-xs">{caseData.candidates?.passport_number}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Commission Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Worker Type</label>
            <select
              value={workerTypeId}
              onChange={(e) => setWorkerTypeId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">Not set</option>
              {workerTypes.map((wt) => (
                <option key={wt.id} value={wt.id}>{wt.name_en} ({wt.name_ar})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intermediary</label>
            <select
              value={intermediaryId}
              onChange={(e) => setIntermediaryId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">None</option>
              {intermediaries.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>
        {commission && (
          <div className="grid gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-3">
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
        {!commission && workerTypeId && (
          <p className="text-xs text-amber-600">No commission rule matches this combination. Configure rules in commission matrix.</p>
        )}
      </div>

      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Stage Progress</h2>
        <div className="space-y-2">
          {STAGES.map((s, index) => {
            const isActive = s.value === stage
            const isPast = index < currentIndex && stage !== "cancelled"
            const isFuture = index > currentIndex
            const isDisabled = s.value === "completed" || s.value === "cancelled"

            return (
              <button
                key={s.value}
                type="button"
                disabled={isDisabled}
                onClick={() => handleStageChange(s.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isActive
                    ? "border-blue-300 bg-blue-50 ring-1 ring-blue-300"
                    : isPast
                    ? "border-green-200 bg-green-50/50"
                    : isDisabled
                    ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {isPast ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : isActive ? (
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                )}
                <div className="flex-1 text-left">
                  <span className={`text-sm font-medium ${isActive ? "text-blue-700" : isPast ? "text-green-700" : "text-gray-600"}`}>
                    {s.label}
                  </span>
                </div>
                {isActive && (
                  <span className={`w-3 h-3 rounded-full ${STAGE_COLORS[s.value]}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border space-y-4">
        <h2 className="font-semibold text-gray-900">Update Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select name="priority" defaultValue={caseData.priority} className="w-full border p-2 rounded">
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Expected Arrival</label>
            <input
              name="expected_arrival"
              type="date"
              defaultValue={caseData.expected_arrival ?? ""}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Actual Arrival</label>
            <input
              name="actual_arrival"
              type="date"
              defaultValue={caseData.actual_arrival ?? ""}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={caseData.notes ?? ""}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
