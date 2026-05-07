"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface AgencyFormProps {
  agency?: {
    id: string
    agency_name: string
    country: string
    commission_rate: number | null
    contact_name: string | null
    contact_email: string | null
    contact_phone: string | null
    rating: number | null
    status: string
    notes: string | null
  }
}

const countries = [
  "Philippines", "Bangladesh", "India", "Pakistan", "Ethiopia",
  "Egypt", "Nepal", "Sri Lanka", "Indonesia", "Kenya", "Uganda",
  "Tanzania", "Ghana", "Nigeria", "Cameroon", "Other",
]

export function AgencyForm({ agency }: AgencyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const payload = {
      agency_name: formData.get("agency_name"),
      country: formData.get("country"),
      commission_rate: parseFloat(formData.get("commission_rate") as string) || 0,
      contact_name: formData.get("contact_name") || null,
      contact_email: formData.get("contact_email") || null,
      contact_phone: formData.get("contact_phone") || null,
      rating: parseFloat(formData.get("rating") as string) || agency?.rating || 0,
      status: formData.get("status") || "active",
      notes: formData.get("notes") || null,
    }

    const { error } = agency
      ? await supabase.from("agencies").update(payload).eq("id", agency.id)
      : await supabase.from("agencies").insert(payload)

    setLoading(false)

    if (error) {
      alert("Error: " + error.message)
    } else {
      router.push("/agencies")
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{agency ? "Edit Agency" : "Add New Agency"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Agency Name</label>
          <input
            name="agency_name"
            required
            defaultValue={agency?.agency_name ?? ""}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Country</label>
          <select
            name="country"
            defaultValue={agency?.country ?? ""}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Agency Fee ($)</label>
          <p className="text-xs text-gray-500 mb-1">Fixed reference fee per recruitment (for reference only)</p>
          <input
            name="commission_rate"
            type="number"
            step="0.01"
            defaultValue={agency?.commission_rate ?? ""}
            className="w-full border p-2 rounded"
            placeholder="e.g. 50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Contact Name</label>
            <input
              name="contact_name"
              defaultValue={agency?.contact_name ?? ""}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rating (0-5)</label>
            <input
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              defaultValue={agency?.rating ?? ""}
              className="w-full border p-2 rounded"
              placeholder="4.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="contact_email"
              type="email"
              defaultValue={agency?.contact_email ?? ""}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="contact_phone"
              defaultValue={agency?.contact_phone ?? ""}
              className="w-full border p-2 rounded"
              placeholder="+63..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select name="status" defaultValue={agency?.status ?? "active"} className="w-full border p-2 rounded">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={agency?.notes ?? ""}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : agency ? "Update Agency" : "Save Agency"}
          </Button>
        </div>
      </form>
    </div>
  )
}
