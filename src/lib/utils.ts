import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | null) {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const STAGE_LABELS: Record<string, string> = {
  new_request: "New Request",
  documents_collection: "Documents Collection",
  medical: "Medical",
  visa_processing: "Visa Processing",
  ticketing: "Ticketing",
  departure: "Departure",
  arrival: "Arrival",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const STAGE_COLORS: Record<string, string> = {
  new_request: "bg-blue-100 text-blue-800",
  documents_collection: "bg-purple-100 text-purple-800",
  medical: "bg-yellow-100 text-yellow-800",
  visa_processing: "bg-orange-100 text-orange-800",
  ticketing: "bg-indigo-100 text-indigo-800",
  departure: "bg-cyan-100 text-cyan-800",
  arrival: "bg-green-100 text-green-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
}

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
}

export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  operations_manager: "Operations Manager",
  recruiter: "Recruiter",
  finance_officer: "Finance Officer",
  external_agency: "External Agency",
}
