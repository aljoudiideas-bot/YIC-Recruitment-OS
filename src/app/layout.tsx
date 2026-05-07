import "./globals.css"
import type { Metadata } from "next"
import { PwaRegister } from "@/components/pwa-register"

export const metadata: Metadata = {
  title: "YIC Recruitment OS",
  description: "Operational Recruitment Execution System",
  manifest: "/manifest.json",
  icons: [
    { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
    { url: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icons/icon-512x512.svg" />
      </head>
      <body className="min-h-screen bg-gray-50">
        {children}
        <PwaRegister />
      </body>
    </html>
  )
}
