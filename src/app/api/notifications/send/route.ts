import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail, buildNotificationHtml } from "@/lib/notifications/email"

export async function POST() {
  const supabase = await createClient()

  const { data: notifications } = await supabase
    .from("notifications")
    .select(`
      id,
      type,
      title,
      message,
      user_id,
      profiles!inner(email, full_name)
    `)
    .eq("is_read", false)
    .limit(10)

  if (!notifications || notifications.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0
  for (const notification of notifications) {
    const profile = Array.isArray(notification.profiles)
      ? notification.profiles[0]
      : notification.profiles

    if (!profile?.email) continue

    const html = buildNotificationHtml(notification.title, notification.message, notification.type)
    const result = await sendEmail({
      to: profile.email,
      subject: notification.title,
      html,
    })

    if (!result.error) sent++
  }

  return NextResponse.json({ sent })
}
