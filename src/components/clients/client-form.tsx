"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ClientFormProps {
  client?: {
    id: string
    company_name: string
    industry: string | null
    contact_name: string | null
    contact_email: string | null
    contact_phone: string | null
    commercial_registration: string | null
    status: string
    notes: string | null
  }
}

export function ClientForm({ client }: ClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const payload = {
      company_name: formData.get("company_name"),
      industry: formData.get("industry") || null,
      contact_name: formData.get("contact_name") || null,
      contact_email: formData.get("contact_email") || null,
      contact_phone: formData.get("contact_phone") || null,
      commercial_registration: formData.get("cr") || null,
      status: formData.get("status") || "active",
      notes: formData.get("notes") || null,
    }

    const { error } = client
      ? await supabase.from("clients").update(payload).eq("id", client.id)
      : await supabase.from("clients").insert(payload)

    setLoading(false)

    if (error) {
      alert("Error: " + error.message)
    } else {
      router.push("/clients")
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{client ? "Edit Client" : "Add New Client"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input
            name="company_name"
            required
            defaultValue={client?.company_name ?? ""}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Industry</label>
          <input
            name="industry"
            defaultValue={client?.industry ?? ""}
            className="w-full border p-2 rounded"
            placeholder="e.g. Construction, Healthcare, Retail"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Contact Name</label>
            <input
              name="contact_name"
              defaultValue={client?.contact_name ?? ""}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CR Number</label>
            <input
              name="cr"
              defaultValue={client?.commercial_registration ?? ""}
              className="w-full border p-2 rounded"
              placeholder="Commercial Registration #"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="contact_email"
              type="email"
              defaultValue={client?.contact_email ?? ""}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="contact_phone"
              defaultValue={client?.contact_phone ?? ""}
              className="w-full border p-2 rounded"
              placeholder="+966..."
            />
          </div>
        </div>

        {!client && (
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="status" defaultValue="active" className="w-full border p-2 rounded">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        )}

        {client && (
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="status" defaultValue={client.status} className="w-full border p-2 rounded">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={client?.notes ?? ""}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : client ? "Update Client" : "Save Client"}
          </Button>
        </div>
      </form>
    </div>
  )
}
