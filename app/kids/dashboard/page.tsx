"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Sparkles, BookOpen, Trophy, Star, Flame, Lock, CheckCircle, Play, Award } from "lucide-react"
import Link from "next/link"

interface KidsModule {
  id: number
  title: string
  description: string
  dayNumber: number
  content: string
  isActive: boolean
  progress: number
  isLocked: boolean
  isCompleted: boolean
  sections: {
    id: number
    title: string
    completed: boolean
  }[]
}

export default function KidsDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState<KidsModule[]>([])
  const [overallProgress, setOverallProgress] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    if (!user?.permissions.accessKids) {
      router.push("/")
      return
    }

    loadModules()
    setLoading(false)
  }, [isAuthenticated, user, router])

  const loadModules = async () => {
    try {
      // For now, we'll create modules based on the sample structure
      // In a real implementation, this would come from the database
      const sampleModules: KidsModule[] = [
        {
          id: 1,
          title: "Module 1: Welcome to the Fire Station!",
          description: "Introduction to fire safety and meeting our heroes",
          dayNumber: 1,
          content: "Learn about fire safety basics and meet firefighter Berong!",
          isActive: true,
          progress: 0,
          isLocked: false,
          isCompleted: false,
          sections: [
            { id: 1, title: "1.1 Introduction to Fire Safety", completed: false },
            { id: 2, title: "1.2 Your Community Heroes", completed: false },
            { id: 3, title: "1.3 The Super Sniffer: Smoke Alarms", completed: false },
            { id: 4, title: "1.4 Mission: Smoke Alarm Hunt", completed: false },
            { id: 5, title: "1.5 Module 1 Quiz", completed: false }
          ]
        },
        {
          id: 2,
          title: "Module 2: The Proactive Protector",
          description: "Kitchen safety and home hazard prevention",
          dayNumber: 2,
          content: "Learn about kitchen safety and electrical hazards",
          isActive: true,
          progress: 0,
          isLocked: true,
          isCompleted: false,
          sections: [
            { id: 1, title: "2.1 Kitchen Safety 101", completed: false },
            { id: 2, title: "2.2 Video: Coco's Kitchen Mishap", completed: false },
            { id: 3, title: "2.3 The Plug Patrol: Electrical Safety", completed: false },
            { id: 4, title: "2.4 Mission: Home Hazard Checklist", completed: false },
            { id: 5, title: "2.5 Module 2 Quiz", completed: false }
          ]
        },
        {
          id: 3,
          title: "Module 3: The Action Plan",
          description: "Emergency response and escape planning",
          dayNumber: 3,
          content: "Learn how to create and practice escape plans",
          isActive: true,
          progress: 0,
          isLocked: true,
          isCompleted: false,
          sections: [
            { id: 1, title: "3.1 Your Great Escape Plan", completed: false },
            { id: 2, title: "3.2 Video: Get Low and Go!", completed: false },
            { id: 3, title: "3.3 Mission: Draw Your Escape Plan", completed: false },
            { id: 4, title: "3.4 Module 3 Quiz", completed: false }
          ]
        },
        {
          id: 4,
          title: "Module 4: Community Champion",
          description: "Community safety and emergency procedures",
          dayNumber: 4,
          content: "Learn about community safety and emergency calls",
          isActive: true,
          progress: 0,
          isLocked: true,
          isCompleted: false,
          sections: [
            { id: 1, title: "4.1 How to Call for Help", completed: false },
            { id: 2, title: "4.2 Fire Extinguishers", completed: false },
            { id: 3, title: "4.3 Video: The P.A.S.S. Method", completed: false },
            { id: 4, title: "4.4 Module 4 Quiz", completed: false }
          ]
        },
        {
          id: 5,
          title: "Final Certification",
          description: "Junior Fire Marshal certification exam",
          dayNumber: 5,
          content: "Complete your journey to become a certified Junior Fire Marshal!",
          isActive: true,
          progress: 0,
          isLocked: true,
          isCompleted: false,
          sections: [
            { id: 1, title: "Final Exam", completed: false }
          ]
        }
      ]

      setModules(sampleModules)

      // Calculate overall progress
      const completedModules = sampleModules.filter(m => m.isCompleted).length
      const totalModules = sampleModules.length
      setOverallProgress((completedModules / totalModules) * 100)
    } catch (error) {
      console.error('Error loading modules:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading your learning adventure...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Courses/Modules Sidebar - Hidden on mobile, visible on desktop */}
          <aside className="hidden lg:block w-full lg:w-80 flex-shrink-0">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Your Courses
                </CardTitle>
                <CardDescription>Learning modules to become a Junior Fire Marshal</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4 p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {modules.map((module) => (
                    <div key={module.id} className={`p-3 rounded-lg ${
                      module.isCompleted
                        ? 'bg-green-50 border-green-200'
                        : module.isLocked
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-blue-200'
                    } border`}>
                      <div className="flex items-start gap-2">
                        <div className={`p-1 rounded-full ${
                          module.isCompleted
                            ? 'bg-green-500 text-white'
                            : module.isLocked
                              ? 'bg-gray-400 text-white'
                              : 'bg-blue-500 text-white'
                        }`}>
                          {module.isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : module.isLocked ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <BookOpen className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{module.title}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant={module.isCompleted ? "default" : module.isLocked ? "secondary" : "outline"} className="text-xs h-5 px-1.5 py-0">
                              Day {module.dayNumber}
                            </Badge>
                            <span className="text-xs text-gray-600">{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-1 mt-1" />
                        </div>
                      </div>
                      {!module.isLocked && !module.isCompleted && (
                        <Link href={`/kids/modules/${module.id}`}>
                          <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
                            Continue Learning
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content - Courses on top for mobile, games in center */}
          <div className="flex-1">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="bg-blue-600 text-white p-3 rounded-full">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-blue-600">
                  SafeScape Academy
                </h1>
                <div className="bg-purple-600 text-white p-3 rounded-full">
                  <Award className="h-8 w-8" />
                </div>
              </div>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Welcome back, <strong>{user?.name}</strong>! Continue your journey to become a Junior Fire Marshal!
              </p>
            </div>

            {/* Progress Overview */}
            <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Trophy className="h-6 w-6" />
                  Your Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-100">Overall Progress</span>
                    <span className="font-bold">{Math.round(overallProgress)}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-3 bg-white/20" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{modules.filter(m => m.isCompleted).length}</div>
                    <div className="text-blue-100 text-sm">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{modules.filter(m => !m.isLocked && !m.isCompleted).length}</div>
                    <div className="text-blue-100 text-sm">In Progress</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{modules.filter(m => m.isLocked).length}</div>
                    <div className="text-blue-100 text-sm">Locked</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{modules.length}</div>
                    <div className="text-blue-100 text-sm">Total Modules</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions for Games */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Games & Activities</h2>
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Link href="/kids/games/clicker/">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300 p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-blue-10 p-3 rounded-full">
                        <Flame className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-base">Clicker Game</CardTitle>
                      <CardDescription className="text-xs">Fire Fighting</CardDescription>
                    </div>
                  </Card>
                </Link>

                <Link href="/kids/games/flammable-shooter/">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-20 hover:border-blue-300 p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-blue-10 p-3 rounded-full">
                        <Flame className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-base">Shooter Game</CardTitle>
                      <CardDescription className="text-xs">Fire Fighting</CardDescription>
                    </div>
                  </Card>
                </Link>

                <Link href="/kids/games/llama-o-rama/">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300 p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Flame className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-base">Llama O Rama</CardTitle>
                      <CardDescription className="text-xs">Fire Fighting</CardDescription>
                    </div>
                  </Card>
                </Link>

                <Link href="/kids/games/msunicorn/">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-gray-20 hover:border-blue-300 p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-blue-10 p-3 rounded-full">
                        <Flame className="h-6 w-6 text-blue-600" />
                      </div>
                      <CardTitle className="text-base">MsUnicorn</CardTitle>
                      <CardDescription className="text-xs">Fire Fighting</CardDescription>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Games Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Learning Activities</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-200 hover:border-orange-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500 text-white p-3 rounded-full">
                        <Trophy className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Fire Safety Quiz</CardTitle>
                        <CardDescription>Test your knowledge!</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href="/kids/quiz">
                      <Button className="w-full">
                        Play Now
                        <Play className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200 hover:border-purple-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500 text-white p-3 rounded-full">
                        <Star className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Memory Match</CardTitle>
                        <CardDescription>Fun learning game!</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href="/kids/memory-game">
                      <Button className="w-full">
                        Play Now
                        <Play className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 hover:border-green-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-green-50 text-white p-3 rounded-full">
                        <Play className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Educational Videos</CardTitle>
                        <CardDescription>Watch and learn!</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href="/kids/videos">
                      <Button className="w-full">
                        Play Now
                        <Play className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Certificate Section */}
            {overallProgress === 10 && (
              <Card className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Award className="h-8 w-8" />
                    Congratulations, Junior Fire Marshal!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">You've completed all modules and earned your Junior Fire Marshal Certificate!</p>
                  <Button className="bg-white text-orange-600 hover:bg-gray-100">
                    <Award className="h-4 w-4 mr-2" />
                    View Certificate
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
