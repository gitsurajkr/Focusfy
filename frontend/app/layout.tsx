import type React from "react"
import { Geist } from "next/font/google"
import { ThemeProvider } from "./components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"

const geist = Geist({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${geist.className} bg-background text-foreground`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
