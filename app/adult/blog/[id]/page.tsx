"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calendar, User, Flame, AlertCircle } from "lucide-react"
import type { BlogPost } from "@/lib/mock-data"
import Link from "next/link"

export default function BlogPostPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [blog, setBlog] = useState<BlogPost | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    if (!user?.permissions.accessAdult) {
      router.push("/")
      return
    }

    // Load blog post from database
    const loadBlog = async () => {
      try {
        const response = await fetch(`/api/content/blogs/${params.id}`)
        if (response.ok) {
          const blogData = await response.json()
          setBlog(blogData)
        } else {
          setBlog(null)
        }
      } catch (error) {
        console.error('Error loading blog post:', error)
        setBlog(null)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadBlog()
    }
  }, [isAuthenticated, user, router, params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Blog post not found.</p>
              <Link href="/adult">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Articles
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/adult">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
        </Link>

        {/* Blog Post */}
        <article>
          <Card>
            <CardHeader>
              {blog.imageUrl && (
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-6">
                  <img
                    src={blog.imageUrl || "/placeholder.svg"}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(blog.title)}`
                    }}
                  />
                </div>
              )}
              <CardTitle className="text-3xl mb-4">{blog.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{blog.createdAt}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{blog.content}</p>
              </div>
            </CardContent>
          </Card>

          {/* Related Safety Alert */}
          <Alert className="mt-6 border-bfp-blue bg-bfp-blue/5">
            <Flame className="h-4 w-4 text-bfp-blue" />
            <AlertDescription className="text-gray-700">
              <strong>Remember:</strong> In case of fire emergency, call 911 immediately. Never put yourself at risk
              trying to fight a large fire.
            </AlertDescription>
          </Alert>
        </article>
      </main>
    </div>
  )
}
