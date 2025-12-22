"use client"

import { ContentCard, ContentCardData } from "./content-card"

interface ContentGridProps {
  contents: ContentCardData[]
  emptyMessage?: string
}

export function ContentGrid({ contents, emptyMessage = "No content available yet. Check back soon! 🎉" }: ContentGridProps) {
  if (contents.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-8xl mb-6">😊</div>
        <p className="text-2xl font-bold text-gray-600">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-12">
      {contents.map((content) => (
        <ContentCard key={content.id} content={content} />
      ))}
    </div>
  )
}
