"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function CommissionRulesClient({ ruleId }: { ruleId: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm("Delete this commission rule? This action cannot be undone.")) return
    const supabase = createClient()
    const { error } = await supabase.from("commission_rules").delete().eq("id", ruleId)
    if (error) {
      alert("Error: " + error.message)
    } else {
      router.refresh()
    }
  }

  return (
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  )
}
