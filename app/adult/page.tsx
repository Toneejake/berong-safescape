"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Flame, Search, BookOpen, Calendar, User, ArrowRight, Zap, AlertCircle } from "lucide-react"
import type { BlogPost } from "@/lib/mock-data"
import Link from "next/link"

export default function AdultPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    if (!user?.permissions.accessAdult) {
      router.push("/")
      return
    }

    // Load blogs from database
    const loadBlogs = async () => {
      try {
        const response = await fetch('/api/content/blogs')
        if (response.ok) {
          const allBlogs = await response.json()
          setBlogs(allBlogs.filter((blog: any) => blog.category === "adult"))
        } else {
          console.error('Failed to load blogs')
        }
      } catch (error) {
        console.error('Error loading blogs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBlogs()
  }, [isAuthenticated, user, router])

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-bold text-foreground">Adult Fire Safety Education</h1>
          </div>
          <p className="text-muted-foreground">Comprehensive fire safety knowledge for adults and homeowners</p>
        </div>

        {/* Access Notice */}
        <Alert className="mb-6 border-accent bg-accent/5">
          <Flame className="h-4 w-4 text-accent" />
          <AlertDescription className="text-foreground">
            Learn essential fire safety practices to protect your home and family.
          </AlertDescription>
        </Alert>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-accent">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-6 w-6 text-accent" />
                <CardTitle className="text-xl">Fire Safety Blogs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-pretty">
                Read comprehensive articles on home fire safety, prevention tips, and emergency preparedness.
              </p>
              <p className="text-sm font-semibold text-accent">{blogs.length} articles available</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-secondary">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-6 w-6 text-secondary" />
                <CardTitle className="text-xl">Fire Spread Simulation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-pretty">
                Interactive tool to visualize how fire spreads in different environments and conditions.
              </p>
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Launch Simulator
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search fire safety articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Blog Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-foreground">Fire Safety Articles</h2>
          {filteredBlogs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No articles found matching your search." : "No articles available yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <Link key={blog.id} href={`/adult/blog/${blog.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      {blog.imageUrl && (
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-3">
                          <img
                            src={blog.imageUrl || "/placeholder.svg"}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(blog.title)}`
                            }}
                          />
                        </div>
                      )}
                      <CardTitle className="text-lg line-clamp-2">{blog.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{blog.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{blog.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{blog.createdAt}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Safety Tips Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Quick Safety Tips</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-accent/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="text-lg">Home Fire Prevention</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Install smoke detectors on every level of your home</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Test smoke alarms monthly and replace batteries annually</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Keep fire extinguishers in accessible locations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Never leave cooking unattended</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>Keep flammable materials away from heat sources</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/5 to-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Emergency Response</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>Create and practice a fire escape plan with your family</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>Know two ways out of every room</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>Establish a meeting point outside your home</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>Call 911 immediately in case of fire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>Never go back inside a burning building</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
