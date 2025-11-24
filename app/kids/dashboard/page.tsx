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
      // Featured Module/Exam CTA - Always first
      {
        id: "module-main",
        title: "🎓 Start Your Fire Safety Journey!",
        description: "Complete fun lessons and become a Junior Fire Marshal",
        type: "module",
        emoji: "🚒",
        href: "/kids/modules",
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
        href: "/kids/games/House-Player-Defense",
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

      // More Modules
      {
        id: "module-1",
        title: "Module 1: Welcome to Fire Safety",
        description: "Introduction to fire safety and smoke alarms",
        type: "module",
        emoji: "📚",
        href: "/kids/modules/1",
        category: "modules"
      },
      {
        id: "module-2",
        title: "Module 2: Kitchen Safety",
        description: "Learn about kitchen and electrical hazards",
        type: "module",
        emoji: "🍳",
        href: "/kids/modules/2",
        isLocked: true,
        category: "modules"
      },
      {
        id: "module-3",
        title: "Module 3: Escape Plans",
        description: "Create and practice your family escape plan",
        type: "module",
        emoji: "🚪",
        href: "/kids/modules/3",
        isLocked: true,
        category: "modules"
      },
      {
        id: "module-4",
        title: "Module 4: Community Safety",
        description: "Learn how to call for help and use fire extinguishers",
        type: "module",
        emoji: "🧯",
        href: "/kids/modules/4",
        isLocked: true,
        category: "modules"
      },
      {
        id: "exam-1",
        title: "🏆 Final Certification Exam",
        description: "Become a certified Junior Fire Marshal!",
        type: "exam",
        emoji: "🎖️",
        href: "/kids/modules/exam",
        isLocked: true,
        category: "modules"
      },
    ]

    setAllContent(content)
    setFilteredContent(content)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">Loading your learning adventure...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
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
  )
}
