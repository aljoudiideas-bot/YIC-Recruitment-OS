import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { CommissionRulesTable } from "./table"

export default function CommissionRulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Rules</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure commission rules per worker type, agency, and client combination
          </p>
        </div>
        <Button asChild>
          <Link href="/commission-rules/new">
            <Plus className="mr-2 h-4 w-4" />
            New Rule
          </Link>
        </Button>
      </div>
      <CommissionRulesTable />
    </div>
  )
}
