const RESEND_API_URL = "https://api.resend.com/emails"

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured — email not sent")
    return { error: "RESEND_API_KEY not configured" }
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "YIC Recruitment <notifications@your-domain.com>",
      to,
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("Resend error:", err)
    return { error: err }
  }

  return await res.json()
}

export function buildNotificationHtml(
  title: string,
  message: string,
  type: string,
): string {
  const iconMap: Record<string, string> = {
    visa_delay: "⚠️",
    missing_document: "📄",
    payment_overdue: "💰",
    stage_change: "🔄",
    task_due: "⏰",
    general: "📢",
  }

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background: #1e293b; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 18px;">YIC Recruitment OS</h1>
      </div>
      <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 32px; margin: 0 0 16px;">${iconMap[type] || "📢"}</p>
        <h2 style="margin: 0 0 8px; font-size: 16px; color: #1e293b;">${title}</h2>
        <p style="margin: 0; color: #64748b; font-size: 14px;">${message}</p>
      </div>
    </div>
  `
}
