"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navigation } from "@/components/navigation"
import { KidsWelcomeBanner } from "@/components/kids-welcome-banner"
import { KidsNavBar, ContentCategory } from "@/components/kids-nav-bar"
import { ContentGrid } from "@/components/content-grid"
import { ContentCardData } from "@/components/content-card"
import { Footer } from "@/components/footer"
import Particles from "@/components/ui/particles"

export default function KidsDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [activeCategory, setActiveCategory] = useState<ContentCategory>("all")
  const [allContent, setAllContent] = useState<ContentCardData[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentCardData[]>([])

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    if (!user?.permissions.accessKids) {
      router.push("/")
      return
    }

    loadContent()
  }, [isAuthenticated, user, router, isLoading])

  useEffect(() => {
    // Filter content based on active category
    if (activeCategory === "all") {
      setFilteredContent(allContent)
    } else {
      const categoryMap: { [key in ContentCategory]?: string } = {
        games: "game",
        videos: "video",
        activities: "activity",
        modules: "module"
      }
      const filterType = categoryMap[activeCategory]
      setFilteredContent(allContent.filter(c => c.type === filterType || c.category === activeCategory))
    }
  }, [activeCategory, allContent])

  const loadContent = () => {
    // Create content array with games, videos, and modules
    const content: ContentCardData[] = [
      // SafeScape Course - The main learning course
      {
        id: "safescape-course",
        title: "🔥 SafeScape Fire Safety Course",
        description: "Complete 5 exciting modules to become a Fire Safety Hero! Learn about the Fire Triangle, escape plans, and more!",
        type: "module",
        emoji: "🛡️",
        href: "/kids/safescape",
        isNew: true,
        category: "modules"
      },

      // Games
      {
        id: "game-1",
        title: "Fire Safety Clicker",
        description: "Click to save the day! Learn fire safety while having fun",
        type: "game",
        emoji: "🖱️",
        href: "/kids/games/clicker",
        difficulty: "easy",
        category: "games"
      },
      {
        id: "game-2",
        title: "Flammable Shooter",
        description: "Identify and avoid flammable objects in this action game",
        type: "game",
        emoji: "🎯",
        href: "/kids/games/flammable-shooter",
        difficulty: "medium",
        category: "games"
      },
      {
        id: "game-3",
        title: "Llama-O-Rama",
        description: "Help Llama escape from fire hazards!",
        type: "game",
        emoji: "🦙",
        href: "/kids/games/llama-o-rama",
        difficulty: "easy",
        category: "games"
      },
      {
        id: "game-4",
        title: "Ms. Unicorn's Adventure",
        description: "Join Ms. Unicorn on a fire safety quest",
        type: "game",
        emoji: "🦄",
        href: "/kids/games/msunicorn",
        difficulty: "easy",
        category: "games"
      },
      {
        id: "game-5",
        title: "House Player Defense",
        description: "Defend your house from fire hazards in this strategy game",
        type: "game",
        emoji: "🏠",
        href: "/kids/games/house-player-defense",
        difficulty: "hard",
        category: "games"
      },

      // Videos
      {
        id: "video-1",
        title: "Fire Safety Basics",
        description: "Learn the fundamentals of staying safe from fire",
        type: "video",
        emoji: "📺",
        href: "/kids/videos",
        duration: "5 min",
        category: "videos"
      },
      {
        id: "video-2",
        title: "Stop, Drop, and Roll",
        description: "What to do if your clothes catch fire",
        type: "video",
        emoji: "🎬",
        href: "/kids/videos",
        duration: "3 min",
        category: "videos"
      },

      // Activities
      {
        id: "activity-1",
        title: "Fire Safety Quiz",
        description: "Test your knowledge with fun questions!",
        type: "activity",
        emoji: "❓",
        href: "/kids/quiz",
        difficulty: "medium",
        category: "activities"
      },
      {
        id: "activity-2",
        title: "Memory Game",
        description: "Match fire safety symbols and tools",
        type: "activity",
        emoji: "🧠",
        href: "/kids/memory-game",
        difficulty: "easy",
        category: "activities"
      },
    ]

    setAllContent(content)
    setFilteredContent(content)
  }

  if (isLoading) {
    return null // Global PageLoader handles loading
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Particles Background - Fire themed */}
      <Particles
        className="z-0"
        quantity={100}
        color="#ef4444"
        size={2.5}
        staticity={30}
        ease={80}
      />
      <Particles
        className="z-0"
        quantity={60}
        color="#f97316"
        size={3}
        staticity={50}
        ease={60}
      />
      <Particles
        className="z-0"
        quantity={40}
        color="#fbbf24"
        size={2}
        staticity={40}
        ease={70}
      />

      <div className="relative z-10">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Banner */}
          <KidsWelcomeBanner />

          {/* Navigation Bar */}
          <KidsNavBar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          {/* Content Grid */}
          <ContentGrid
            contents={filteredContent}
            emptyMessage={`No ${activeCategory === "all" ? "" : activeCategory} content available yet. Check back soon! 🎉`}
          />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

