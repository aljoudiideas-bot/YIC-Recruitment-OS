"use client"

import { useState } from "react"
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
    candidates: { full_name: string; nationality: string; passport_number: string } | null
    clients: { company_name: string } | null
    agencies: { agency_name: string; country: string } | null
  }
}

export function CaseEditForm({ caseData }: CaseEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState(caseData.current_stage)
  const [status, setStatus] = useState(caseData.status)

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
    }

    const { error } = await supabase.from("cases").update(payload).eq("id", caseData.id)

    setLoading(false)

    if (error) {
      alert("Error: " + error.message)
    } else {
      router.push("/cases")
    }
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
