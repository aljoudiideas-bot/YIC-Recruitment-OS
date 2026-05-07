import { createClient } from "@/lib/supabase/server"
import { TransactionForm } from "@/components/finance/transaction-form"
import { notFound } from "next/navigation"

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: transaction } = await supabase
    .from("financial_transactions")
    .select("*")
    .eq("id", id)
    .single()

  if (!transaction) {
    notFound()
  }

  return <TransactionForm transaction={transaction} />
}
