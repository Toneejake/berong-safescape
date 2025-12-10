import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { Chatbot } from "@/components/chatbot"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Berong E-Learning for BFP Sta Cruz",
  description: "Educational platform for fire safety training and awareness",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased relative min-h-screen">
        {/* Background Image Layer - 20% opacity */}
        <div
          className="fixed inset-0 opacity-20 bg-cover bg-center z-0 pointer-events-none"
          style={{ backgroundImage: "url('/bfp-firefighters-in-action.jpg')" }}
        />

        {/* Content Layer - Full opacity */}
        <div className="relative z-10">
          <AuthProvider>
            {children}
            <Chatbot />
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}
