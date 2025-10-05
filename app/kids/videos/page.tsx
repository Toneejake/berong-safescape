"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play } from "lucide-react"
import Link from "next/link"

const kidsVideos = [
  {
    id: "1",
    title: "Fire Safety for Kids",
    youtubeId: "kMGrundV4KY",
    description: "Learn important fire safety rules in a fun way!",
  },
  {
    id: "2",
    title: "Stop, Drop, and Roll",
    youtubeId: "eDQXFWOy3Ek",
    description: "Learn what to do if your clothes catch fire!",
  },
  {
    id: "3",
    title: "Meet a Firefighter",
    youtubeId: "CtvUSvNfVCY",
    description: "See what firefighters do every day!",
  },
]

export default function KidsVideosPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState(kidsVideos[0])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    if (!user?.permissions.accessKids) {
      router.push("/")
      return
    }

    setLoading(false)
  }, [isAuthenticated, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50">
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/kids">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activities
          </Button>
        </Link>

        <Card className="border-4 border-green-500 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">{selectedVideo.title}</CardTitle>
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
            <p className="text-gray-700">{selectedVideo.description}</p>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-4 text-gray-900">More Videos</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {kidsVideos.map((video) => (
            <Card
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className={`cursor-pointer hover:shadow-lg transition-all ${
                selectedVideo.id === video.id ? "border-4 border-green-500" : "border-2 border-gray-200"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-2 relative group">
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
