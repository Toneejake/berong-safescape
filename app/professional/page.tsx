"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Video, Clock, Search, BookOpen, FileText, AlertCircle, Play } from "lucide-react"
import type { VideoContent } from "@/lib/mock-data"

export default function ProfessionalPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<VideoContent[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    if (!user?.permissions.accessProfessional) {
      router.push("/")
      return
    }

    // Load videos from database
    const loadVideos = async () => {
      try {
        const response = await fetch('/api/content/videos')
        if (response.ok) {
          const videosData = await response.json()
          setVideos(videosData)
        } else {
          console.error('Failed to load videos')
        }
      } catch (error) {
        console.error('Error loading videos:', error)
      }
    }

    loadVideos()
    setLoading(false)
  }, [isAuthenticated, user, router])

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()),
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
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Professional Training</h1>
          </div>
          <p className="text-muted-foreground">
            Advanced firefighting techniques and professional development resources
          </p>
        </div>

        {/* Access Notice */}
        <Alert className="mb-6 border-primary bg-primary/5">
          <Shield className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            This section contains professional-level content for firefighters and fire safety professionals.
          </AlertDescription>
        </Alert>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Training Videos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{videos.length} professional training videos</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-secondary">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-secondary" />
                <CardTitle className="text-lg">BFP Manuals</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Standard operating procedures and guidelines</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <CardTitle className="text-lg">Fire Codes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Fire safety regulations and compliance</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search training videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Video Player */}
        {selectedVideo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{selectedVideo.title}</CardTitle>
              <CardDescription>{selectedVideo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{selectedVideo.duration}</span>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                  Professional
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Training Videos</h2>
          {filteredVideos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No videos found matching your search.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <Card
                  key={video.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => setSelectedVideo(video)}
                >
                  <CardHeader className="pb-3">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-3 relative">
                      <img
                        src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{video.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{video.duration}</span>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                        Professional
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Resources Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Additional Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="h-6 w-6 text-secondary" />
                  <CardTitle>BFP Standard Operating Procedures</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-pretty">
                  Access comprehensive manuals covering firefighting operations, emergency response protocols, and
                  safety procedures.
                </p>
                <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                  <FileText className="h-4 w-4 mr-2" />
                  View Manuals
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-6 w-6 text-accent" />
                  <CardTitle>Fire Code & Regulations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-pretty">
                  Stay updated with the latest fire safety codes, building regulations, and compliance requirements.
                </p>
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  <FileText className="h-4 w-4 mr-2" />
                  View Fire Codes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
