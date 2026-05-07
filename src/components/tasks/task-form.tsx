"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface TaskFormProps {
  task?: {
    id: string
    case_id: string | null
    title: string
    description: string | null
    assigned_to: string | null
    due_date: string | null
    status: string
    priority: string
  }
}

export function TaskForm({ task }: TaskFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cases, setCases] = useState<{ id: string; case_number: string }[]>([])
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const [{ data: casesData }, { data: usersData }] = await Promise.all([
        supabase.from("cases").select("id, case_number").order("case_number"),
        supabase.from("profiles").select("id, full_name").order("full_name"),
      ])
      if (casesData) setCases(casesData)
      if (usersData) setUsers(usersData)
    }
    fetchData()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const caseId = formData.get("case_id") as string
    const assignedTo = formData.get("assigned_to") as string

    const payload = {
      title: formData.get("title"),
      description: formData.get("description") || null,
      case_id: caseId === "" ? null : caseId,
      assigned_to: assignedTo === "" ? null : assignedTo,
      due_date: (formData.get("due_date") as string) || null,
      status: formData.get("status"),
      priority: formData.get("priority"),
    }

    const { error } = task
      ? await supabase.from("tasks").update(payload).eq("id", task.id)
      : await supabase.from("tasks").insert(payload)

    setLoading(false)

    if (error) {
      alert("Error: " + error.message)
    } else {
      router.push("/tasks")
    }
  }

  const statusLabels: Record<string, string> = {
    to_do: "To Do",
    in_progress: "In Progress",
    done: "Done",
    cancelled: "Cancelled",
  }

  const priorityLabels: Record<string, string> = {
    low: "Low",
    normal: "Normal",
    high: "High",
    urgent: "Urgent",
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{task ? "Edit Task" : "Create New Task"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            name="title"
            required
            defaultValue={task?.title ?? ""}
            className="w-full border p-2 rounded"
            placeholder="e.g. Review visa documents"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={task?.description ?? ""}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Related Case (Optional)</label>
            <select name="case_id" defaultValue={task?.case_id ?? ""} className="w-full border p-2 rounded">
              <option value="">No case</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>{c.case_number}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assign To</label>
            <select name="assigned_to" defaultValue={task?.assigned_to ?? ""} className="w-full border p-2 rounded">
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select name="status" defaultValue={task?.status ?? "to_do"} className="w-full border p-2 rounded">
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select name="priority" defaultValue={task?.priority ?? "normal"} className="w-full border p-2 rounded">
              {Object.entries(priorityLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Due Date (Optional)</label>
          <input name="due_date" type="date" defaultValue={task?.due_date ?? ""} className="w-full border p-2 rounded" />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </div>
  )
}
