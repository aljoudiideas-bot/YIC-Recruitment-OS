import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { ROLE_LABELS } from "@/lib/utils"
import Link from "next/link"

export default async function SettingsPage() {
  const supabase = await createClient()

  const [{ data: profiles }, { data: tenant }, { data: activityLogs }] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name"),
    supabase.from("tenants").select("*").single(),
    supabase
      .from("activity_logs")
      .select(`
        id,
        entity_type,
        entity_id,
        action,
        description,
        created_at,
        profiles:user_id (full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(50),
  ])

  const roleVariants: Record<string, "default" | "success" | "warning" | "danger" | "info" | "gray"> = {
    admin: "danger",
    operations_manager: "info",
    recruiter: "default",
    finance_officer: "success",
    external_agency: "gray",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage company, users, and view activity logs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company</CardTitle>
          <CardDescription>Your organization details</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Company Name</dt>
              <dd className="mt-1 font-medium">{tenant?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Slug</dt>
              <dd className="mt-1 font-mono text-sm">{tenant?.slug ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Created</dt>
              <dd className="mt-1">{tenant?.created_at ? formatDate(tenant.created_at) : "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Users with access to this workspace</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings/invite">Invite User</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium text-gray-500">Name</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Email</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Role</th>
                  <th className="pb-2 text-left font-medium text-gray-500">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(profiles ?? []).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-2.5 font-medium">{p.full_name}</td>
                    <td className="py-2.5 text-gray-600">{p.email}</td>
                    <td className="py-2.5">
                      <Badge variant={roleVariants[p.role] ?? "gray"}>
                        {ROLE_LABELS[p.role] ?? p.role}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-gray-500">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!profiles || profiles.length === 0) && (
              <p className="py-8 text-center text-sm text-gray-500">No team members yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Recent changes across the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(activityLogs ?? []).map((log) => {
              const profileData = (Array.isArray(log.profiles) ? log.profiles[0] : log.profiles) as { full_name: string } | undefined
              return (
                <div key={log.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {profileData?.full_name ?? "System"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{log.description}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {log.entity_type} &middot; {log.action}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              )
            })}
          </div>
          {(!activityLogs || activityLogs.length === 0) && (
            <p className="py-8 text-center text-sm text-gray-500">No activity yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
