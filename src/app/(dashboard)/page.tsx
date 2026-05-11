"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CasesChart } from "@/components/dashboard/cases-chart"
import { ProfitChart } from "@/components/dashboard/profit-chart"
import { ActiveCasesTable } from "@/components/dashboard/active-cases-table"
import { AlertsList } from "@/components/dashboard/alerts-list"
import { PeriodFilter } from "@/components/dashboard/period-filter"
import { FolderKanban, DollarSign, TrendingUp, AlertTriangle, FileClock, Plane } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"

function getDateRange(period: string) {
  const now = new Date()
  let start: Date
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  switch (period) {
    case "week":
      start = new Date(now)
      start.setDate(now.getDate() - 7)
      break
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case "quarter":
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      break
    case "year":
      start = new Date(now.getFullYear(), 0, 1)
      break
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1)
  }
  return { start: start.toISOString(), end: end.toISOString() }
}

function getWeekRange() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - dayOfWeek)
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  return { start: startOfWeek.toISOString(), end: endOfWeek.toISOString() }
}

export default function DashboardPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const [params, setParams] = useState<{ period?: string }>({})
  const [data, setData] = useState({
    activeCasesCount: 0,
    delayedCasesCount: 0,
    pendingDocsCount: 0,
    arrivalsWeekCount: 0,
    totalRevenue: 0,
    totalCosts: 0,
    activeCases: [] as Record<string, unknown>[],
    alerts: [] as Record<string, unknown>[],
    stageDistribution: [] as Record<string, unknown>[],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    searchParams.then(setParams)
  }, [searchParams])

  useEffect(() => {
    const period = params.period ?? "month"
    const { start: periodStart, end: periodEnd } = getDateRange(period)
    const { start: weekStart, end: weekEnd } = getWeekRange()
    const supabase = createClient()

    Promise.all([
      supabase.from("cases").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase
        .from("cases")
        .select("*", { count: "exact", head: true })
        .eq("current_stage", "visa_processing")
        .lt("updated_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("documents").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase
        .from("cases")
        .select("*", { count: "exact", head: true })
        .gte("expected_arrival", weekStart)
        .lte("expected_arrival", weekEnd),
      supabase
        .from("financial_transactions")
        .select("amount")
        .eq("transaction_type", "client_payment")
        .gte("transaction_date", periodStart)
        .lte("transaction_date", periodEnd),
      supabase
        .from("financial_transactions")
        .select("amount")
        .in("transaction_type", ["agency_commission", "operational_cost"])
        .gte("transaction_date", periodStart)
        .lte("transaction_date", periodEnd),
      supabase
        .from("cases")
        .select("id, case_number, current_stage, status, priority, expected_arrival, created_at, candidates(full_name, nationality)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("notifications")
        .select("*")
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("cases").select("current_stage, status").eq("status", "active"),
    ]).then(([
      { count: activeCasesCount },
      { count: delayedCasesCount },
      { count: pendingDocsCount },
      { count: arrivalsWeekCount },
      { data: periodPayments },
      { data: periodCosts },
      { data: activeCases },
      { data: alerts },
      { data: stageDistribution },
    ]) => {
      const totalRevenue = (periodPayments ?? []).reduce((sum, t) => sum + Number(t.amount), 0)
      const totalCosts = (periodCosts ?? []).reduce((sum, t) => sum + Number(t.amount), 0)
      setData({
        activeCasesCount: activeCasesCount ?? 0,
        delayedCasesCount: delayedCasesCount ?? 0,
        pendingDocsCount: pendingDocsCount ?? 0,
        arrivalsWeekCount: arrivalsWeekCount ?? 0,
        totalRevenue,
        totalCosts,
        activeCases: (activeCases ?? []).map((c) => ({
          ...c,
          candidates: Array.isArray(c.candidates) ? c.candidates[0] ?? null : c.candidates,
        })),
        alerts: alerts ?? [],
        stageDistribution: stageDistribution ?? [],
      })
      setLoading(false)
    })
  }, [params.period])

  if (loading) {
    return <div className="py-12 text-center text-sm text-gray-500">Loading...</div>
  }

  const period = params.period ?? "month"
  const netProfit = data.totalRevenue - data.totalCosts
  const profitMargin = data.totalRevenue > 0 ? ((netProfit / data.totalRevenue) * 100).toFixed(1) : "0.0"

  const stageCounts: Record<string, number> = {}
  for (const c of data.stageDistribution) {
    stageCounts[c.current_stage as string] = (stageCounts[c.current_stage as string] || 0) + 1
  }

  const stageLabels: Record<string, string> = {
    new_request: "New Request",
    documents_collection: "Documents",
    medical: "Medical",
    visa_processing: "Visa",
    ticketing: "Ticketing",
    departure: "Departure",
    arrival: "Arrival",
    completed: "Completed",
    cancelled: "Cancelled",
  }
  const stageColors: Record<string, string> = {
    new_request: "#3b82f6",
    documents_collection: "#8b5cf6",
    medical: "#f59e0b",
    visa_processing: "#f97316",
    ticketing: "#6366f1",
    departure: "#06b6d4",
    arrival: "#22c55e",
    completed: "#10b981",
    cancelled: "#ef4444",
  }
  const casesChartData = Object.entries(stageCounts).map(([stage, count]) => ({
    name: stageLabels[stage] ?? stage,
    value: count,
    color: stageColors[stage] ?? "#6b7280",
  }))

  const kpis = [
    {
      label: "Active Cases",
      value: data.activeCasesCount,
      change: `${data.activeCasesCount} ongoing`,
      icon: FolderKanban,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Revenue",
      value: formatCurrency(data.totalRevenue),
      change: `payments`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Net Profit",
      value: formatCurrency(netProfit),
      change: `${profitMargin}% margin`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Delayed Cases",
      value: data.delayedCasesCount,
      change: "Over 14 days in visa",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Pending Docs",
      value: data.pendingDocsCount,
      change: "Documents awaiting verification",
      icon: FileClock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Arrivals This Week",
      value: data.arrivalsWeekCount,
      change: "",
      icon: Plane,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Overview of your recruitment operations</p>
        </div>
        <PeriodFilter />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.label}
              </CardTitle>
              <div className={cn("rounded-lg p-2", kpi.bg)}>
                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="mt-1 text-xs text-gray-500">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Case Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <CasesChart data={casesChartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitChart revenue={data.totalRevenue} costs={data.totalCosts} payments={0} costTransactions={0} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Active Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <ActiveCasesTable cases={data.activeCases as never[]} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertsList alerts={data.alerts as never[]} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
