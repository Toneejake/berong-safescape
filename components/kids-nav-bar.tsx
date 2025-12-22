"use client"

import { useState } from "react"
import { Gamepad2, Video, Sparkles, BookOpen, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export type ContentCategory = "all" | "games" | "videos" | "activities" | "modules"

interface KidsNavBarProps {
  activeCategory: ContentCategory
  onCategoryChange: (category: ContentCategory) => void
}

export function KidsNavBar({ activeCategory, onCategoryChange }: KidsNavBarProps) {
  const categories = [
    { id: "all" as ContentCategory, label: "All", icon: Home, color: "bg-blue-500 hover:bg-blue-600" },
    { id: "videos" as ContentCategory, label: "Videos", icon: Video, color: "bg-purple-500 hover:bg-purple-600" },
    { id: "games" as ContentCategory, label: "Games", icon: Gamepad2, color: "bg-green-500 hover:bg-green-600" },
    { id: "activities" as ContentCategory, label: "Activities", icon: Sparkles, color: "bg-yellow-500 hover:bg-yellow-600" },
    { id: "modules" as ContentCategory, label: "My Lessons", icon: BookOpen, color: "bg-red-500 hover:bg-red-600" },
  ]

  return (
    <div className="mb-8">
      {/* Desktop Navigation - Horizontal */}
      <div className="hidden md:flex justify-center gap-4 flex-wrap">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = activeCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg",
                isActive
                  ? `${category.color} text-white scale-105 ring-4 ring-offset-2 ring-offset-white`
                  : "bg-white text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-6 w-6" />
              <span>{category.label}</span>
            </button>
          )
        })}
      </div>

      {/* Mobile Navigation - Fit all 5 buttons */}
      <div className="md:hidden">
        <div className="flex justify-between gap-1.5">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl font-bold text-[10px] transition-all flex-1 min-w-0",
                  isActive
                    ? `${category.color} text-white ring-2 ring-offset-1`
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate w-full text-center">{category.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
