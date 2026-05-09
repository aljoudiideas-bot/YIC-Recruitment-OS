import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CasesChart } from "@/components/dashboard/cases-chart"
import { ProfitChart } from "@/components/dashboard/profit-chart"
import { ActiveCasesTable } from "@/components/dashboard/active-cases-table"
import { AlertsList } from "@/components/dashboard/alerts-list"
import { PeriodFilter } from "@/components/dashboard/period-filter"
import { FolderKanban, DollarSign, TrendingUp, AlertTriangle, FileClock, Plane } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { formatCurrency, cn } from "@/lib/utils"
import { getServerT } from "@/lib/i18n/server"

function getDateRange(period: string) {
  const now = new Date()
  let start: Date
  let end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

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

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const params = await searchParams
  const period = params.period ?? "month"
  const { start: periodStart, end: periodEnd } = getDateRange(period)
  const { start: weekStart, end: weekEnd } = getWeekRange()
  const t = await getServerT()

  const supabase = await createClient()

  const [
    { count: activeCasesCount },
    { count: delayedCasesCount },
    { count: pendingDocsCount },
    { count: arrivalsWeekCount },
    { data: periodPayments },
    { data: periodCosts },
    { data: activeCases },
    { data: alerts },
    { data: stageDistribution },
  ] = await Promise.all([
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
  ])

  const totalRevenue = periodPayments?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0
  const totalCosts = periodCosts?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0
  const netProfit = totalRevenue - totalCosts
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0"

  const stageCounts: Record<string, number> = {}
  for (const c of stageDistribution ?? []) {
    stageCounts[c.current_stage] = (stageCounts[c.current_stage] || 0) + 1
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

  const normalizedActiveCases = (activeCases ?? []).map((c) => ({
    ...c,
    candidates: Array.isArray(c.candidates) ? c.candidates[0] ?? null : c.candidates,
  }))

  const periodLabels: Record<string, string> = {
    week: t('dashboard.thisWeek'),
    month: t('dashboard.thisMonth'),
    quarter: t('dashboard.thisQuarter'),
    year: t('dashboard.thisYear'),
  }

  const kpis = [
    {
      label: t('dashboard.activeCases'),
      value: activeCasesCount ?? 0,
      change: `${activeCasesCount ?? 0} ${t('dashboard.ongoing')}`,
      icon: FolderKanban,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: `${periodLabels[period]} ${t('dashboard.revenue')}`,
      value: formatCurrency(totalRevenue),
      change: `${periodPayments?.length ?? 0} ${t('dashboard.payments')}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: t('dashboard.netProfit'),
      value: formatCurrency(netProfit),
      change: `${profitMargin}% ${t('dashboard.margin')}`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: t('dashboard.delayedCases'),
      value: delayedCasesCount ?? 0,
      change: t('dashboard.delayedDesc'),
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: t('dashboard.pendingDocs'),
      value: pendingDocsCount ?? 0,
      change: t('dashboard.pendingDocsDesc'),
      icon: FileClock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: t('dashboard.arrivalsWeek'),
      value: arrivalsWeekCount ?? 0,
      change: `${t('dashboard.weekOf')} ${new Date(weekStart).toLocaleDateString()}`,
      icon: Plane,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('dashboard.subtitle')}
          </p>
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
            <CardTitle>{t('dashboard.caseDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CasesChart data={casesChartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.revenueVsCosts')} ({periodLabels[period]})</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitChart revenue={totalRevenue} costs={totalCosts} payments={periodPayments?.length ?? 0} costTransactions={periodCosts?.length ?? 0} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.activeCasesList')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ActiveCasesTable cases={normalizedActiveCases} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertsList alerts={alerts ?? []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
