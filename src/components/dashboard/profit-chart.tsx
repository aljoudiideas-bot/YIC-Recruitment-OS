"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface ProfitChartProps {
  revenue: number
  costs: number
  payments: number
  costTransactions: number
}

export function ProfitChart({ revenue, costs, payments, costTransactions }: ProfitChartProps) {
  const data = [
    { name: "Revenue", amount: revenue, count: payments, fill: "#10b981" },
    { name: "Costs", amount: costs, count: costTransactions, fill: "#ef4444" },
  ]

  const maxVal = Math.max(revenue, costs, 1)

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            domain={[0, Math.ceil(maxVal / 1000) * 1000]}
          />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend />
          <Bar dataKey="amount" name="Amount (USD)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center text-xs text-gray-500">
        Profit: <span className="font-semibold text-green-600">{formatCurrency(revenue - costs)}</span>
        {" "}from {payments} payment{payments !== 1 ? "s" : ""} and {costTransactions} cost{costTransactions !== 1 ? "s" : ""}
      </div>
    </div>
  )
}
