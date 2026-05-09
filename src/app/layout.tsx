import "./globals.css"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { PwaRegister } from "@/components/pwa-register"
import { I18nProvider } from "@/lib/i18n/context"
import type { Locale } from "@/lib/i18n/context"

export const metadata: Metadata = {
  title: "YIC Recruitment OS",
  description: "Operational Recruitment Execution System",
  manifest: "/manifest.json",
  icons: [
    { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
  ],
  appleWebApp: {
    capable: true,
    title: "YIC OS",
    statusBarStyle: "default",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const locale = (cookieStore.get("locale")?.value || "en") as Locale
  const dir = locale === "ar" ? "rtl" : "ltr"

  return (
    <html lang={locale} dir={dir}>
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icons/icon-512x512.png" />
      </head>
      <body className="min-h-screen bg-gray-50" style={{ direction: dir }}>
        <I18nProvider locale={locale}>
          {children}
          <PwaRegister />
        </I18nProvider>
      </body>
    </html>
  )
}
