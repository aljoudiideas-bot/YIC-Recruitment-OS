"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function InviteUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    alert(
      "To invite users, you need to:\n\n" +
      "1. Go to Supabase Dashboard - Authentication\n" +
      "2. Add the user manually OR\n" +
      "3. Set up Supabase Edge Functions for invite emails\n\n" +
      "User details:\n" +
      `Email: ${formData.get("email")}\n` +
      `Name: ${formData.get("full_name")}\n` +
      `Role: ${formData.get("role")}`
    )

    setLoading(false)
    router.push("/settings")
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Invite User</h1>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        User invitations require Supabase service role access. For now, add users manually via Supabase Dashboard {"->"} Authentication {"->"} Users.
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input name="full_name" required className="w-full border p-2 rounded" placeholder="John Doe" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" required className="w-full border p-2 rounded" placeholder="john@company.com" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select name="role" defaultValue="recruiter" className="w-full border p-2 rounded">
            <option value="admin">Admin</option>
            <option value="operations_manager">Operations Manager</option>
            <option value="recruiter">Recruiter</option>
            <option value="finance_officer">Finance Officer</option>
            <option value="external_agency">External Agency</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Invite"}
          </Button>
        </div>
      </form>
    </div>
  )
}
