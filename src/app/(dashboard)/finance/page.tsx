import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, TrendingDown, Pencil } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"

const typeLabels: Record<string, string> = {
  client_payment: "Client Payment",
  agency_commission: "Agency Commission",
  operational_cost: "Operational Cost",
  other: "Other",
}

const typeColors: Record<string, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  client_payment: "success",
  agency_commission: "danger",
  operational_cost: "warning",
  other: "gray",
}

export default async function FinancePage() {
  const supabase = await createClient()

  const { data: transactions } = await supabase
    .from("financial_transactions")
    .select(`
      id,
      transaction_type,
      amount,
      currency,
      description,
      transaction_date,
      reference_number,
      cases (case_number)
    `)
    .order("transaction_date", { ascending: false })
    .limit(50)

  const txnList = transactions ?? []
  const totalRevenue = txnList
    .filter((t: { transaction_type: string }) => t.transaction_type === "client_payment")
    .reduce((s: number, t: { amount: number }) => s + t.amount, 0)
  const totalCosts = txnList
    .filter((t: { transaction_type: string }) => t.transaction_type !== "client_payment")
    .reduce((s: number, t: { amount: number }) => s + t.amount, 0)
  const netProfit = totalRevenue - totalCosts

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track revenues, costs, and profitability
          </p>
        </div>
        <Button asChild>
          <Link href="/finance/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-600">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">
                {formatCurrency(totalCosts)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-2xl font-bold ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(netProfit)}
            </span>
            {totalRevenue > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {((netProfit / totalRevenue) * 100).toFixed(1)}% margin
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium text-gray-500">Case</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Type</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Amount</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Currency</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Ref #</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Date</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Description</th>
                  <th className="pb-2 text-left font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {txnList.map((t: Record<string, unknown>) => {
                  const caseData = t.cases as { case_number: string } | null
                  return (
                    <tr key={t.id as string} className="hover:bg-gray-50">
                      <td className="py-2.5 font-medium text-blue-600">
                        {caseData?.case_number ?? "—"}
                      </td>
                      <td className="py-2.5">
                        <Badge variant={typeColors[t.transaction_type as string] ?? "gray"}>
                          {typeLabels[t.transaction_type as string]}
                        </Badge>
                      </td>
                      <td className={`py-2.5 font-medium ${t.transaction_type === "client_payment" ? "text-emerald-600" : "text-red-600"}`}>
                        {t.transaction_type === "client_payment" ? "+" : "-"}
                        {formatCurrency(Number(t.amount), t.currency as string)}
                      </td>
                      <td className="py-2.5 text-gray-600">{t.currency as string}</td>
                      <td className="py-2.5 font-mono text-xs text-gray-500">{t.reference_number as string ?? "—"}</td>
                      <td className="py-2.5 text-gray-600">{formatDate(t.transaction_date as string)}</td>
                      <td className="py-2.5 text-gray-500">{t.description as string ?? "—"}</td>
                      <td className="py-2.5">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                          <Link href={`/finance/${t.id as string}/edit`}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {txnList.length === 0 && (
              <div className="py-8 text-center text-sm text-gray-500">
                No transactions yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
