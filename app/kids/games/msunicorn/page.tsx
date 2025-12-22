"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MsUnicornPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-900 to-purple-950">
            {/* Header with back button */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/kids/dashboard")}
                    className="text-white hover:bg-white/20"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Games
                </Button>
                <h1 className="text-white font-bold text-lg hidden sm:block">🦄 Ms. Unicorn&apos;s Adventure</h1>
                <Button
                    variant="ghost"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
            </div>

            {/* Loading overlay */}
            {isLoading && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-b from-purple-900 via-pink-900 to-purple-950">
                    <div className="text-center">
                        <Loader2 className="h-16 w-16 animate-spin text-pink-400 mx-auto mb-4" />
                        <p className="text-white text-xl font-semibold">Loading Ms. Unicorn&apos;s Adventure...</p>
                        <p className="text-pink-300 mt-2">Join Ms. Unicorn on a fire safety quest! 🦄</p>
                    </div>
                </div>
            )}

            {/* Game iframe */}
            <iframe
                src="/games/msunicorn/index.html"
                className="fixed inset-0 w-full h-full pt-14 border-0"
                onLoad={() => setIsLoading(false)}
                allow="fullscreen; autoplay"
                title="Ms. Unicorn Adventure Game"
            />
        </div>
    )
}
