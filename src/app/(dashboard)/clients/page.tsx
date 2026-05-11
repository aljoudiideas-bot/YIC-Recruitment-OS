"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface Client {
  id: string
  company_name: string
  industry: string | null
  contact_name: string | null
  contact_email: string | null
  commercial_registration: string | null
  status: string
  created_at: string
}

const statusColors: Record<string, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  active: "success",
  inactive: "gray",
  blocked: "danger",
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from("clients").select("*").order("company_name").then(({ data }) => {
      setClients((data ?? []) as Client[])
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saudi Clients</h1>
          <p className="mt-1 text-sm text-gray-500">Manage client companies and contracts</p>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Company</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Industry</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Contact</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">CR Number</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Created</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{client.company_name}</td>
                <td className="px-4 py-3 text-gray-600">{client.industry ?? "—"}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-gray-700">{client.contact_name ?? "—"}</p>
                    <p className="text-xs text-gray-500">{client.contact_email}</p>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                  {client.commercial_registration ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusColors[client.status] ?? "gray"}>
                    {client.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(client.created_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/clients/${client.id}/edit`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && clients.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            No clients yet. Add your first client to get started.
          </div>
        )}
      </div>
    </div>
  )
}
