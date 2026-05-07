"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface TransactionFormProps {
  transaction?: {
    id: string
    case_id: string | null
    transaction_type: string
    amount: number
    currency: string
    description: string | null
    transaction_date: string
    reference_number: string | null
  }
}

export function TransactionForm({ transaction }: TransactionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cases, setCases] = useState<{ id: string; case_number: string }[]>([])

  useEffect(() => {
    const fetchCases = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("cases")
        .select("id, case_number")
        .order("case_number")
      if (data) setCases(data)
    }
    fetchCases()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const caseId = formData.get("case_id") as string
    const amountStr = formData.get("amount") as string

    const payload = {
      case_id: caseId === "" ? null : caseId,
      transaction_type: formData.get("transaction_type"),
      amount: parseFloat(amountStr),
      currency: formData.get("currency") || "USD",
      description: formData.get("description") || null,
      transaction_date: formData.get("transaction_date"),
      reference_number: formData.get("reference_number") || null,
    }

    const { error } = transaction
      ? await supabase.from("financial_transactions").update(payload).eq("id", transaction.id)
      : await supabase.from("financial_transactions").insert(payload)

    setLoading(false)

    if (error) {
      alert("Error: " + error.message)
    } else {
      router.push("/finance")
    }
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{transaction ? "Edit Transaction" : "Add New Transaction"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Transaction Type</label>
          <select name="transaction_type" required defaultValue={transaction?.transaction_type ?? ""} className="w-full border p-2 rounded">
            <option value="">Select type</option>
            <option value="client_payment">Client Payment</option>
            <option value="agency_commission">Agency Commission</option>
            <option value="operational_cost">Operational Cost</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Related Case (Optional)</label>
          <select name="case_id" defaultValue={transaction?.case_id ?? ""} className="w-full border p-2 rounded">
            <option value="">No case</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>{c.case_number}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={transaction?.amount ?? ""}
              className="w-full border p-2 rounded"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select name="currency" defaultValue={transaction?.currency ?? "USD"} className="w-full border p-2 rounded">
              <option value="USD">USD</option>
              <option value="SAR">SAR</option>
              <option value="PHP">PHP</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Transaction Date</label>
          <input
            name="transaction_date"
            type="date"
            required
            defaultValue={transaction?.transaction_date ?? today}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Reference Number</label>
          <input
            name="reference_number"
            defaultValue={transaction?.reference_number ?? ""}
            className="w-full border p-2 rounded"
            placeholder="e.g. INV-2024-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={transaction?.description ?? ""}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : transaction ? "Update Transaction" : "Save Transaction"}
          </Button>
        </div>
      </form>
    </div>
  )
}
