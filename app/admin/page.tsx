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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ImageIcon, FileText, Video, Users, Plus, Trash2, AlertCircle, CheckCircle, HelpCircle } from "lucide-react"
import type { CarouselImage, BlogPost } from "@/lib/mock-data"
import { ImageUpload } from "@/components/ui/image-upload"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

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

  // Video Management
  const [videos, setVideos] = useState<any[]>([])
  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    youtubeId: "",
    category: "professional" as "professional" | "adult" | "kids",
    duration: "",
    isActive: true
  })

  // User Management
  const [users, setUsers] = useState<any[]>([])
  
  // Quick Questions Management
  const [quickQuestions, setQuickQuestions] = useState<any[]>([])
  const [newQuickQuestion, setNewQuickQuestion] = useState({
    category: "emergency",
    questionText: "",
    responseText: "",
    isActive: true
  })

  // Confirmation Dialog State
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    action: "",
    item: null as any,
    onConfirm: () => {},
  });

  // Confirmation Dialog Functions
  const openConfirmationDialog = (title: string, description: string, action: string, onConfirm: () => void, item: any = null) => {
    setConfirmationDialog({
      isOpen: true,
      title,
      description,
      action,
      item,
      onConfirm,
    });
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialog({
      ...confirmationDialog,
      isOpen: false,
    });
  };

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
    loadVideos() // Load videos
    loadUsers()
    loadQuickQuestions()
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

  const loadVideos = async () => {
    try {
      const response = await fetch('/api/admin/videos')
      if (response.ok) {
        const videos = await response.json()
        setVideos(videos)
      } else {
        console.error('Failed to load videos')
      }
    } catch (error) {
      console.error('Error loading videos:', error)
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

  const loadQuickQuestions = async () => {
    try {
      const response = await fetch('/api/admin/quick-questions')
      if (response.ok) {
        const questions = await response.json()
        setQuickQuestions(questions)
      } else {
        console.error('Failed to load quick questions')
      }
    } catch (error) {
      console.error('Error loading quick questions:', error)
    }
  }

  const handleAddQuickQuestion = () => {
    if (!newQuickQuestion.questionText || !newQuickQuestion.responseText || !newQuickQuestion.category) {
      setError("Please fill all quick question fields")
      return
    }

    openConfirmationDialog(
      "Add Quick Question",
      "Are you sure you want to add this quick question?",
      "add-quick-question",
      async () => {
        try {
          const response = await fetch('/api/admin/quick-questions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newQuickQuestion),
          })

          if (response.ok) {
            await loadQuickQuestions() // Reload the list
            setNewQuickQuestion({ category: "emergency", questionText: "", responseText: "", isActive: true })
            setSuccess("Quick question added successfully")
            setTimeout(() => setSuccess(""), 3000)
          } else {
            const errorData = await response.json()
            setError(errorData.error || "Failed to add quick question")
          }
        } catch (error) {
          console.error('Error adding quick question:', error)
          setError("Network error occurred")
        } finally {
          closeConfirmationDialog();
        }
      }
    );
  }

  const handleDeleteQuickQuestion = (id: number) => {
    openConfirmationDialog(
      "Delete Quick Question",
      "Are you sure you want to delete this quick question? This action cannot be undone.",
      "delete-quick-question",
      async () => {
        try {
          const response = await fetch(`/api/admin/quick-questions/${id}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            await loadQuickQuestions() // Reload the list
            setSuccess("Quick question deleted")
            setTimeout(() => setSuccess(""), 3000)
          } else {
            setError("Failed to delete quick question")
          }
        } catch (error) {
          console.error('Error deleting quick question:', error)
          setError("Network error occurred")
        } finally {
          closeConfirmationDialog();
        }
      }
    );
  }

  const handleAddCarousel = () => {
    if (!newCarousel.title || !newCarousel.alt || !newCarousel.url) {
      setError("Please fill all carousel fields")
      return
    }

    openConfirmationDialog(
      "Add Carousel Image",
      "Are you sure you want to add this carousel image?",
      "add-carousel-image",
      async () => {
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
        } finally {
          closeConfirmationDialog();
        }
      }
    );
  }

  const handleDeleteCarousel = (id: string) => {
    // Convert string ID to number for API
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      setError("Invalid carousel image ID");
      return;
    }

    openConfirmationDialog(
      "Delete Carousel Image",
      "Are you sure you want to delete this carousel image? This action cannot be undone.",
      "delete-carousel-image",
      async () => {
        try {
          const response = await fetch(`/api/admin/carousel/${numericId}`, {
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
        } finally {
          closeConfirmationDialog();
        }
      },
      { id: numericId }
    );
  }

  const handleAddBlog = () => {
    if (!newBlog.title || !newBlog.excerpt || !newBlog.content) {
      setError("Please fill all blog fields")
      return
    }

    openConfirmationDialog(
      "Add Blog Post",
      "Are you sure you want to add this blog post?",
      "add-blog-post",
      async () => {
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
        } finally {
          closeConfirmationDialog();
        }
      }
    );
  }

  const handleDeleteBlog = (id: string) => {
    openConfirmationDialog(
      "Delete Blog Post",
      "Are you sure you want to delete this blog post? This action cannot be undone.",
      "delete-blog-post",
      async () => {
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
        } finally {
          closeConfirmationDialog();
        }
      },
      { id }
    );
  }

  const handleAddVideo = () => {
    if (!newVideo.title || !newVideo.youtubeId || !newVideo.category) {
      setError("Please fill all video fields");
      return;
    }

    openConfirmationDialog(
      "Add Video",
      "Are you sure you want to add this video?",
      "add-video",
      async () => {
        try {
          const response = await fetch('/api/admin/videos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newVideo),
          });

          if (response.ok) {
            await loadVideos(); // Reload the list
            setNewVideo({ title: "", description: "", youtubeId: "", category: "professional", duration: "", isActive: true });
            setSuccess("Video added successfully");
            setTimeout(() => setSuccess(""), 3000);
          } else {
            const errorData = await response.json();
            setError(errorData.error || "Failed to add video");
          }
        } catch (error) {
          console.error('Error adding video:', error);
          setError("Network error occurred");
        } finally {
          closeConfirmationDialog();
        }
      }
    );
  }

  const handleDeleteVideo = (id: string) => {
    // Convert string ID to number for API
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      setError("Invalid video ID");
      return;
    }

    openConfirmationDialog(
      "Delete Video",
      "Are you sure you want to delete this video? This action cannot be undone.",
      "delete-video",
      async () => {
        try {
          const response = await fetch(`/api/admin/videos/${numericId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            await loadVideos(); // Reload the list
            setSuccess("Video deleted");
            setTimeout(() => setSuccess(""), 3000);
          } else {
            setError("Failed to delete video");
          }
        } catch (error) {
          console.error('Error deleting video:', error);
          setError("Network error occurred");
        } finally {
          closeConfirmationDialog();
        }
      },
      { id: numericId }
    );
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
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
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
            <TabsTrigger value="quick-questions">
              <HelpCircle className="h-4 w-4 mr-2" />
              Quick Questions
            </TabsTrigger>
          </TabsList>

          <ConfirmationDialog
            isOpen={confirmationDialog.isOpen}
            onClose={closeConfirmationDialog}
            onConfirm={() => {
              confirmationDialog.onConfirm();
            }}
            title={confirmationDialog.title}
            description={confirmationDialog.description}
          />

          {/* Carousel Management */}
          <TabsContent value="carousel" className="space-y-6">
            <ImageUpload 
              title="Upload Carousel Image" 
              description="Upload an image to generate a URL for the carousel"
              onUploadComplete={(url) => setNewCarousel({...newCarousel, url})}
            />
            
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
                <Button onClick={handleAddCarousel} variant="secondary">
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
            <ImageUpload 
              title="Upload Blog Image" 
              description="Upload an image to generate a URL for the blog post"
              onUploadComplete={(url) => setNewBlog({...newBlog, imageUrl: url})}
            />
            
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
                      className="w-full h-10 px-3 rounded-md border-input bg-background"
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
                <Button onClick={handleAddBlog} variant="default">
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
                <CardTitle>Add New Video</CardTitle>
                <CardDescription>Add educational videos for different sections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video-title">Title</Label>
                  <Input
                    id="video-title"
                    placeholder="Video title"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-description">Description</Label>
                  <Textarea
                    id="video-description"
                    placeholder="Video description"
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-youtube-id">YouTube ID</Label>
                    <Input
                      id="video-youtube-id"
                      placeholder="YouTube video ID (e.g., W25rzeEO740)"
                      value={newVideo.youtubeId}
                      onChange={(e) => setNewVideo({ ...newVideo, youtubeId: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="video-duration">Duration</Label>
                    <Input
                      id="video-duration"
                      placeholder="Duration (e.g., 15:30)"
                      value={newVideo.duration}
                      onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-category">Category</Label>
                    <select
                      id="video-category"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={newVideo.category}
                      onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value as "professional" | "adult" | "kids" })}
                    >
                      <option value="professional">Professional</option>
                      <option value="adult">Adult</option>
                      <option value="kids">Kids</option>
                    </select>
                  </div>
                  <div className="space-y-2 flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="video-active"
                      checked={newVideo.isActive}
                      onChange={(e) => setNewVideo({ ...newVideo, isActive: e.target.checked })}
                      className="mr-2 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <Label htmlFor="video-active">Active</Label>
                  </div>
                </div>
                <Button onClick={handleAddVideo} variant="default" className="w-full md:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Videos</CardTitle>
                <CardDescription>{videos.length} videos in database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {videos.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No videos yet</p>
                  ) : (
                    videos.map((video) => (
                      <div key={video.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{video.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${video.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {video.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent capitalize">
                              {video.category}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{video.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            YouTube ID: {video.youtubeId} • Duration: {video.duration}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteVideo(video.id)}
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
                    </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Questions Management */}
          <TabsContent value="quick-questions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Quick Question</CardTitle>
                <CardDescription>Create frequently asked questions for the chatbot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qq-category">Category</Label>
                    <Select
                      value={newQuickQuestion.category}
                      onValueChange={(value) => setNewQuickQuestion({ ...newQuickQuestion, category: value })}
                    >
                      <SelectTrigger id="qq-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency Procedures</SelectItem>
                        <SelectItem value="prevention">Fire Prevention</SelectItem>
                        <SelectItem value="equipment">Safety Equipment</SelectItem>
                        <SelectItem value="general">General Information</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qq-active">Status</Label>
                    <Select
                      value={newQuickQuestion.isActive ? "active" : "inactive"}
                      onValueChange={(value) => setNewQuickQuestion({ ...newQuickQuestion, isActive: value === "active" })}
                    >
                      <SelectTrigger id="qq-active">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qq-question">Question</Label>
                  <Input
                    id="qq-question"
                    placeholder="Enter the question"
                    value={newQuickQuestion.questionText}
                    onChange={(e) => setNewQuickQuestion({ ...newQuickQuestion, questionText: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qq-response">Response</Label>
                  <Textarea
                    id="qq-response"
                    placeholder="Enter the response"
                    value={newQuickQuestion.responseText}
                    onChange={(e) => setNewQuickQuestion({ ...newQuickQuestion, responseText: e.target.value })}
                    rows={4}
                  />
                </div>
                <Button onClick={handleAddQuickQuestion} variant="secondary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quick Question
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Quick Questions</CardTitle>
                <CardDescription>{quickQuestions.length} questions in database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quickQuestions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No quick questions yet</p>
                  ) : (
                    quickQuestions.map((question) => (
                      <div key={question.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{question.questionText}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${question.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {question.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent capitalize">
                              {question.category}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{question.responseText}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteQuickQuestion(question.id)}
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
        </Tabs>
      </main>
    </div>
  )
}
