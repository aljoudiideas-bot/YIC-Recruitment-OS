"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Star } from "lucide-react"
import Link from "next/link"

interface Agency {
  id: string
  agency_name: string
  country: string
  commission_rate: number
  rating: number
  contact_email: string | null
  status: string
}

const statusColors: Record<string, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  active: "success",
  inactive: "gray",
  suspended: "danger",
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from("agencies").select("*").order("agency_name").then(({ data }) => {
      setAgencies((data ?? []) as Agency[])
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sending Agencies</h1>
          <p className="mt-1 text-sm text-gray-500">
            International recruitment agency partners
          </p>
        </div>
        <Button asChild>
          <Link href="/agencies/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Agency
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agencies.map((agency) => (
          <div key={agency.id} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{agency.agency_name}</h3>
                <p className="mt-1 text-sm text-gray-500">{agency.country}</p>
              </div>
              <Badge variant={statusColors[agency.status] ?? "gray"}>
                {agency.status}
              </Badge>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Commission Rate</span>
                <span className="font-medium">{agency.commission_rate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rating</span>
                <span className="flex items-center gap-1 font-medium">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {agency.rating}/5
                </span>
              </div>
              {agency.contact_email && (
                <p className="text-xs text-gray-400">{agency.contact_email}</p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/agencies/${agency.id}/edit`}>Edit</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
      {!loading && agencies.length === 0 && (
        <div className="rounded-xl border bg-white py-12 text-center text-sm text-gray-500">
          No agencies yet. Add your first agency partner.
        </div>
      )}
    </div>
  )
}
