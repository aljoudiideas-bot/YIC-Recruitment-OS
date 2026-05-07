"use client"

import { useSearchParams, useRouter } from "next/navigation"

export function PeriodFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const period = searchParams.get("period") ?? "month"

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams)
    params.set("period", e.target.value)
    router.replace(`?${params.toString()}`)
  }

  return (
    <select
      value={period}
      onChange={handleChange}
      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value="week">This Week</option>
      <option value="month">This Month</option>
      <option value="quarter">This Quarter</option>
      <option value="year">This Year</option>
    </select>
  )
}
