import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

const statusColors: Record<string, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  to_do: "gray",
  in_progress: "info",
  done: "success",
  cancelled: "danger",
}

const priorityColors: Record<string, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
  low: "gray",
  normal: "default",
  high: "warning",
  urgent: "danger",
}

export default async function TasksPage() {
  const supabase = await createClient()

  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      id,
      title,
      description,
      status,
      priority,
      due_date,
      created_at,
      cases (case_number),
      profiles_assigned:assigned_to (full_name)
    `)
    .order("due_date", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">Manage operational tasks and assignments</p>
        </div>
        <Button asChild>
          <Link href="/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(tasks ?? []).map((task) => {
          const caseData = (Array.isArray(task.cases) ? task.cases[0] : task.cases) as { case_number: string } | undefined
          const assignedData = (Array.isArray(task.profiles_assigned) ? task.profiles_assigned[0] : task.profiles_assigned) as { full_name: string } | undefined
          return (
            <div key={task.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <h3 className="font-medium">{task.title}</h3>
                <Badge variant={statusColors[task.status] ?? "gray"}>
                  {task.status.replace("_", " ")}
                </Badge>
              </div>
              {task.description && (
                <p className="mt-2 text-sm text-gray-600">{task.description}</p>
              )}
              <div className="mt-3 space-y-1 text-xs text-gray-500">
                {caseData && (
                  <p>Case: <span className="font-medium text-blue-600">{caseData.case_number}</span></p>
                )}
                <p>Assigned: {assignedData?.full_name ?? "Unassigned"}</p>
                {task.due_date && (
                  <p>Due: {formatDate(task.due_date)}</p>
                )}
                <Badge variant={priorityColors[task.priority] ?? "gray"} className="mt-1">
                  {task.priority}
                </Badge>
              </div>
              <div className="mt-3 pt-3 border-t flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/tasks/${task.id}/edit`}>Edit</Link>
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      {(!tasks || tasks.length === 0) && (
        <div className="rounded-xl border bg-white py-12 text-center text-sm text-gray-500">
          No tasks yet. Create your first task.
        </div>
      )}
    </div>
  )
}
