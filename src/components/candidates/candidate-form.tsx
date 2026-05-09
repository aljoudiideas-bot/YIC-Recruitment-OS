"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface CandidateFormProps {
  candidate?: {
    id: string
    full_name: string
    nationality: string
    passport_number: string
    passport_expiry: string | null
    date_of_birth: string | null
    gender: string | null
    phone: string | null
    email: string | null
    job_role: string
    agency_id: string | null
    medical_status: string
    current_status: string
    photo_url: string | null
  }
  client?: { company_name: string } | null
}

export function CandidateForm({ candidate, client }: CandidateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [agencies, setAgencies] = useState<{ id: string; agency_name: string }[]>([])

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data: agenciesData } = await supabase.from("agencies").select("id, agency_name")
      if (agenciesData) setAgencies(agenciesData)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single()
        if (profile) setTenantId(profile.tenant_id)
      }
    })()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const agencyId = formData.get("agency_id") as string

    const payload = {
      full_name: formData.get("full_name"),
      nationality: formData.get("nationality"),
      passport_number: formData.get("passport_number"),
      passport_expiry: (formData.get("passport_expiry") as string) || null,
      date_of_birth: (formData.get("date_of_birth") as string) || null,
      gender: formData.get("gender") || null,
      phone: formData.get("phone") || null,
      email: formData.get("email") || null,
      job_role: formData.get("job_role"),
      agency_id: agencyId === "" ? null : agencyId,
      medical_status: formData.get("medical_status") || "not_started",
      current_status: formData.get("current_status") || "new",
    }

    if (!candidate && tenantId) {
      ;(payload as Record<string, unknown>).tenant_id = tenantId
    }

    const { error } = candidate
      ? await supabase.from("candidates").update(payload).eq("id", candidate.id)
      : await supabase.from("candidates").insert(payload)

    setLoading(false)

    if (error) {
      alert("Error: " + error.message)
    } else {
      router.push("/candidates")
    }
  }

  const statusLabels: Record<string, string> = {
    new: "New",
    in_process: "In Process",
    deployed: "Deployed",
    cancelled: "Cancelled",
  }

  const medicalLabels: Record<string, string> = {
    not_started: "Not Started",
    pending: "Pending",
    passed: "Passed",
    failed: "Failed",
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{candidate ? "Edit Candidate" : "Add New Candidate"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            name="full_name"
            required
            defaultValue={candidate?.full_name ?? ""}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nationality</label>
            <input
              name="nationality"
              required
              defaultValue={candidate?.nationality ?? ""}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Passport Number</label>
            <input
              name="passport_number"
              required
              defaultValue={candidate?.passport_number ?? ""}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Passport Expiry</label>
            <input
              name="passport_expiry"
              type="date"
              defaultValue={candidate?.passport_expiry ?? ""}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <input
              name="date_of_birth"
              type="date"
              defaultValue={candidate?.date_of_birth ?? ""}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select name="gender" defaultValue={candidate?.gender ?? ""} className="w-full border p-2 rounded">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job Role</label>
            <input
              name="job_role"
              required
              defaultValue={candidate?.job_role ?? ""}
              className="w-full border p-2 rounded"
              placeholder="e.g. Driver, Worker"
            />
          </div>
        </div>

        {client && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-blue-600 font-medium">Saudi Client (from latest case)</p>
            <p className="text-sm font-semibold text-blue-800">{client.company_name}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Sending Agency (Optional)</label>
          <select name="agency_id" defaultValue={candidate?.agency_id ?? ""} className="w-full border p-2 rounded">
            <option value="">-- No Agency --</option>
            {agencies.map((a) => (
              <option key={a.id} value={a.id}>{a.agency_name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="phone"
              defaultValue={candidate?.phone ?? ""}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              defaultValue={candidate?.email ?? ""}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        {candidate && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Medical Status</label>
                <select name="medical_status" defaultValue={candidate.medical_status} className="w-full border p-2 rounded">
                  {Object.entries(medicalLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select name="current_status" defaultValue={candidate.current_status} className="w-full border p-2 rounded">
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : candidate ? "Update Candidate" : "Save Candidate"}
          </Button>
        </div>
      </form>
    </div>
  )
}
