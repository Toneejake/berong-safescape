"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ImageIcon, FileText, Video, Users, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react"
import type { CarouselImage, BlogPost } from "@/lib/mock-data"

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  // Carousel Management
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([])
  const [newCarousel, setNewCarousel] = useState({ title: "", alt: "", url: "" })

  // Blog Management
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [newBlog, setNewBlog] = useState({
    title: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    category: "adult" as "adult" | "professional",
  })

  // User Management
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    if (!user?.permissions.isAdmin) {
      router.push("/")
      return
    }

    // Load data from database
    loadCarouselImages()
    loadBlogPosts()
    loadUsers()
    setLoading(false)
  }, [isAuthenticated, user, router])

  const loadCarouselImages = async () => {
    try {
      const response = await fetch('/api/content/carousel')
      if (response.ok) {
        const images = await response.json()
        setCarouselImages(images)
      } else {
        console.error('Failed to load carousel images')
      }
    } catch (error) {
      console.error('Error loading carousel images:', error)
    }
  }

  const loadBlogPosts = async () => {
    try {
      const response = await fetch('/api/content/blogs')
      if (response.ok) {
        const blogs = await response.json()
        setBlogPosts(blogs)
      } else {
        console.error('Failed to load blog posts')
      }
    } catch (error) {
      console.error('Error loading blog posts:', error)
    }
  }

  const loadUsers = async () => {
    try {
      // For now, we'll use a simple approach to get users
      // In a real implementation, you'd have a proper users API endpoint
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const usersData = await response.json()
        setUsers(usersData)
      } else {
        console.error('Failed to load users')
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleAddCarousel = async () => {
    if (!newCarousel.title || !newCarousel.alt || !newCarousel.url) {
      setError("Please fill all carousel fields")
      return
    }

    try {
      const response = await fetch('/api/admin/carousel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCarousel),
      })

      if (response.ok) {
        await loadCarouselImages() // Reload the list
        setNewCarousel({ title: "", alt: "", url: "" })
        setSuccess("Carousel image added successfully")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to add carousel image")
      }
    } catch (error) {
      console.error('Error adding carousel image:', error)
      setError("Network error occurred")
    }
  }

  const handleDeleteCarousel = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/carousel/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadCarouselImages() // Reload the list
        setSuccess("Carousel image deleted")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to delete carousel image")
      }
    } catch (error) {
      console.error('Error deleting carousel image:', error)
      setError("Network error occurred")
    }
  }

  const handleAddBlog = async () => {
    if (!newBlog.title || !newBlog.excerpt || !newBlog.content) {
      setError("Please fill all blog fields")
      return
    }

    try {
      const blogData = {
        ...newBlog,
        authorId: user?.id || 1, // Default to first user if no current user
      }

      const response = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      })

      if (response.ok) {
        await loadBlogPosts() // Reload the list
        setNewBlog({ title: "", excerpt: "", content: "", imageUrl: "", category: "adult" })
        setSuccess("Blog post added successfully")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to add blog post")
      }
    } catch (error) {
      console.error('Error adding blog post:', error)
      setError("Network error occurred")
    }
  }

  const handleDeleteBlog = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadBlogPosts() // Reload the list
        setSuccess("Blog post deleted")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to delete blog post")
      }
    } catch (error) {
      console.error('Error deleting blog post:', error)
      setError("Network error occurred")
    }
  }

  const handleToggleUserPermission = async (userId: string, permission: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permission }),
      })

      if (response.ok) {
        await loadUsers() // Reload the list
        setSuccess("User permissions updated")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to update user permissions")
      }
    } catch (error) {
      console.error('Error updating user permissions:', error)
      setError("Network error occurred")
    }
  }

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
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">Manage content, users, and platform settings</p>
        </div>

        {/* Alerts */}
        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Admin Tabs */}
        <Tabs defaultValue="carousel" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="carousel">
              <ImageIcon className="h-4 w-4 mr-2" />
              Carousel
            </TabsTrigger>
            <TabsTrigger value="blogs">
              <FileText className="h-4 w-4 mr-2" />
              Blogs
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="h-4 w-4 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>

          {/* Carousel Management */}
          <TabsContent value="carousel" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Carousel Image</CardTitle>
                <CardDescription>Add images to the dashboard carousel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carousel-title">Title</Label>
                    <Input
                      id="carousel-title"
                      placeholder="Image title"
                      value={newCarousel.title}
                      onChange={(e) => setNewCarousel({ ...newCarousel, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carousel-alt">Alt Text</Label>
                    <Input
                      id="carousel-alt"
                      placeholder="Image description"
                      value={newCarousel.alt}
                      onChange={(e) => setNewCarousel({ ...newCarousel, alt: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carousel-url">Image URL</Label>
                  <Input
                    id="carousel-url"
                    placeholder="/path/to/image.jpg or https://..."
                    value={newCarousel.url}
                    onChange={(e) => setNewCarousel({ ...newCarousel, url: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddCarousel} className="bg-bfp-orange hover:bg-bfp-orange/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Carousel Images</CardTitle>
                <CardDescription>{carouselImages.length} images in carousel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {carouselImages.map((image) => (
                    <div key={image.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{image.title}</h4>
                        <p className="text-sm text-muted-foreground">{image.altText}</p>
                        <p className="text-xs text-muted-foreground mt-1">{image.url}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteCarousel(image.id)}
                        className="ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blog Management */}
          <TabsContent value="blogs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Blog Post</CardTitle>
                <CardDescription>Create educational content for adult and professional sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="blog-title">Title</Label>
                    <Input
                      id="blog-title"
                      placeholder="Blog post title"
                      value={newBlog.title}
                      onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blog-category">Category</Label>
                    <select
                      id="blog-category"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={newBlog.category}
                      onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value as "adult" | "professional" })}
                    >
                      <option value="adult">Adult</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-image">Image URL</Label>
                  <Input
                    id="blog-image"
                    placeholder="/path/to/image.jpg"
                    value={newBlog.imageUrl}
                    onChange={(e) => setNewBlog({ ...newBlog, imageUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-excerpt">Excerpt</Label>
                  <Textarea
                    id="blog-excerpt"
                    placeholder="Brief description"
                    value={newBlog.excerpt}
                    onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-content">Content</Label>
                  <Textarea
                    id="blog-content"
                    placeholder="Full blog content"
                    value={newBlog.content}
                    onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                    rows={6}
                  />
                </div>
                <Button onClick={handleAddBlog} className="bg-bfp-blue hover:bg-bfp-blue/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Blog Post
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Blog Posts</CardTitle>
                <CardDescription>{blogPosts.length} blog posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {blogPosts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No blog posts yet</p>
                  ) : (
                    blogPosts.map((post) => (
                      <div key={post.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{post.title}</h4>
                            <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent capitalize">
                              {post.category}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            By {post.author} • {post.createdAt}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteBlog(post.id)}
                          className="ml-4"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Management */}
          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Management</CardTitle>
                <CardDescription>Manage educational videos for different sections</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Video management functionality will allow you to add, edit, and organize YouTube videos for
                  Professional, Adult, and Kids sections.
                </p>
                <Alert>
                  <Video className="h-4 w-4" />
                  <AlertDescription>
                    This feature is currently using placeholder videos. You can extend this section to add custom video
                    management.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user permissions and access levels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No users registered yet</p>
                  ) : (
                    users.map((u) => (
                      <div key={u.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{u.name}</h4>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Age: {u.age} • Role: {u.role}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant={u.permissions.accessKids ? "default" : "outline"}
                            onClick={() => handleToggleUserPermission(u.id, "accessKids")}
                            className={u.permissions.accessKids ? "bg-secondary" : ""}
                          >
                            Kids Access
                          </Button>
                          <Button
                            size="sm"
                            variant={u.permissions.accessAdult ? "default" : "outline"}
                            onClick={() => handleToggleUserPermission(u.id, "accessAdult")}
                            className={u.permissions.accessAdult ? "bg-accent" : ""}
                          >
                            Adult Access
                          </Button>
                          <Button
                            size="sm"
                            variant={u.permissions.accessProfessional ? "default" : "outline"}
                            onClick={() => handleToggleUserPermission(u.id, "accessProfessional")}
                            className={u.permissions.accessProfessional ? "bg-primary" : ""}
                          >
                            Professional Access
                          </Button>
                          <Button
                            size="sm"
                            variant={u.permissions.isAdmin ? "default" : "outline"}
                            onClick={() => handleToggleUserPermission(u.id, "isAdmin")}
                            className={u.permissions.isAdmin ? "bg-foreground text-background" : ""}
                          >
                            Admin
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
