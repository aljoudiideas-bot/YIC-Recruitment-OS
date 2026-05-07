import { createClient } from "@/lib/supabase/server"
import { ClientForm } from "@/components/clients/client-form"
import { notFound } from "next/navigation"

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single()

  if (!client) {
    notFound()
  }

  return <ClientForm client={client} />
}
