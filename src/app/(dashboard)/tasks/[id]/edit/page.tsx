import { createClient } from "@/lib/supabase/server"
import { TaskForm } from "@/components/tasks/task-form"
import { notFound } from "next/navigation"

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: task } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single()

  if (!task) {
    notFound()
  }

  return <TaskForm task={task} />
}
