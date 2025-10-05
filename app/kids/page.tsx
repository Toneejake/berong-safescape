"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, BookOpen, Trophy, Star, Play } from "lucide-react"
import Link from "next/link"

export default function KidsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    if (!user?.permissions.accessKids) {
      router.push("/")
      return
    }

    // Redirect to kids dashboard
    router.push("/kids/dashboard")
  }, [isAuthenticated, user, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center">
          <CardHeader>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-10 w-10 text-blue-600 animate-pulse" />
              <CardTitle className="text-3xl text-blue-600">SafeScape Academy</CardTitle>
              <Sparkles className="h-10 w-10 text-purple-600 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-blue-600 text-white p-3 rounded-full">
                <BookOpen className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Loading Your Learning Adventure...</h2>
              <div className="bg-purple-600 text-white p-3 rounded-full">
                <Trophy className="h-8 w-8" />
              </div>
            </div>

            <p className="text-lg text-gray-700 mb-8">
              Welcome, <strong>{user?.name}</strong>! Get ready to become a Junior Fire Marshal!
            </p>

            <div className="flex items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Redirecting to your personalized dashboard...</p>
            </div>

            <div className="mt-8">
              <Link href="/kids/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
