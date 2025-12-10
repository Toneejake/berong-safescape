"use client"

import { useRef, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface GridVisualizationProps {
  grid: number[][]
  originalImage?: string | null // Base64 image to use as background
  showWallOverlay?: boolean // Whether to show semi-transparent wall overlay
  firePosition?: [number, number] | null
  fireMap?: [number, number][] // Array of fire coordinates
  agentPositions?: [number, number][]
  exits?: [number, number][]
  onCellClick?: (row: number, col: number) => void
  interactive?: boolean
}

export function GridVisualization({
  grid,
  originalImage,
  showWallOverlay = true,
  firePosition,
  fireMap = [],
  agentPositions = [],
  exits = [],
  onCellClick,
  interactive = false
}: GridVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null)
  const [fireIconImage, setFireIconImage] = useState<HTMLImageElement | null>(null)
  const [fireCellAges, setFireCellAges] = useState<Map<string, number>>(new Map())
  const [agentImages, setAgentImages] = useState<HTMLImageElement[]>([])

  const cellSize = 3 // pixels per cell for 256x256 grid
  const canvasSize = grid.length * cellSize

  // Load background image when originalImage prop changes
  useEffect(() => {
    if (originalImage) {
      const img = new Image()
      img.onload = () => setBackgroundImage(img)
      img.src = originalImage.startsWith('data:') ? originalImage : `data:image/png;base64,${originalImage}`
    } else {
      setBackgroundImage(null)
    }
  }, [originalImage])

  // Load fire icon image
  useEffect(() => {
    const img = new Image()
    img.onload = () => setFireIconImage(img)
    img.onerror = () => console.error('Failed to load fire icon')
    img.src = '/fire-icon.png'
  }, [])

  // Animate fire cell ages for smooth transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setFireCellAges(prev => {
        const next = new Map(prev)

        // Collect all fire positions
        const firePositionsSet = new Set<string>()
        if (firePosition) {
          firePositionsSet.add(`${firePosition[0]},${firePosition[1]}`)
        }
        if (fireMap) {
          fireMap.forEach(([r, c]) => {
            firePositionsSet.add(`${r},${c}`)
          })
        }

        // Age existing fire cells
        firePositionsSet.forEach(key => {
          next.set(key, (next.get(key) || 0) + 16)
        })

        // Remove cells that are no longer on fire
        for (const key of next.keys()) {
          if (!firePositionsSet.has(key)) {
            next.delete(key)
          }
        }

        return next
      })
    }, 16)

    return () => clearInterval(interval)
  }, [firePosition, fireMap])

  // Load agent images
  useEffect(() => {
    const images: HTMLImageElement[] = []
    let loadedCount = 0

    for (let i = 1; i <= 5; i++) {
      const img = new Image()
      img.onload = () => {
        loadedCount++
        if (loadedCount === 5) {
          setAgentImages(images)
        }
      }
      img.onerror = () => console.error(`Failed to load agent${i}.png`)
      img.src = `/agent${i}.png`
      images.push(img)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize)

    // Draw background image if available, otherwise draw grid-based walls
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvasSize, canvasSize)

      // Draw semi-transparent wall overlay if enabled
      if (showWallOverlay) {
        ctx.fillStyle = "rgba(31, 41, 55, 0.4)" // dark gray with transparency
        for (let row = 0; row < grid.length; row++) {
          for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] === 1) {
              ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
            }
          }
        }
      }
    } else {
      // Fallback: Draw grid-based walls (original behavior)
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          const isWall = grid[row][col] === 1
          ctx.fillStyle = isWall ? "#1f2937" : "#f3f4f6"
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
        }
      }
    }

    // Draw exits as larger green circles
    for (const [r, c] of exits) {
      const centerX = c * cellSize + cellSize / 2
      const centerY = r * cellSize + cellSize / 2
      const radius = 5

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fillStyle = "#22c55e"
      ctx.fill()
      ctx.strokeStyle = "#16a34a"
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw fire with glow effect - collect all fire positions first
    const firePositions: [number, number][] = []
    if (firePosition) {
      firePositions.push(firePosition)
    }
    // fireMap is now expected to be an array of coordinates
    if (fireMap && Array.isArray(fireMap)) {
      firePositions.push(...fireMap)
    }

    // Draw fire using icon image or fallback to gradient
    if (fireIconImage) {
      for (const [r, c] of firePositions) {
        const centerX = c * cellSize + cellSize / 2
        const centerY = r * cellSize + cellSize / 2
        const iconSize = Math.max(cellSize * 4, 12)

        // Get age for smooth transition animation
        const key = `${r},${c}`
        const age = fireCellAges.get(key) || 0

        // Grow animation: start at 30%, grow to 100% over 300ms
        const growProgress = Math.min(age / 300, 1)
        const scale = 0.3 + (growProgress * 0.7)

        // Fade in: 0 to 1 over 200ms
        const fadeProgress = Math.min(age / 200, 1)

        // Flicker effect: subtle pulsing
        const flicker = 0.85 + Math.sin(Date.now() / 100 + r * 10 + c * 10) * 0.15

        // Combine alpha effects
        const alpha = fadeProgress * flicker

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(centerX, centerY)
        ctx.scale(scale, scale)

        // Optional rotation for variety
        const rotation = (r + c) % 4 * (Math.PI / 8)
        ctx.rotate(rotation)

        ctx.drawImage(
          fireIconImage,
          -iconSize / 2,
          -iconSize / 2,
          iconSize,
          iconSize
        )
        ctx.restore()
      }
    } else {
      // Fallback: Draw fire with realistic glow effect
      for (const [r, c] of firePositions) {
        const centerX = c * cellSize + cellSize / 2
        const centerY = r * cellSize + cellSize / 2

        // Outer glow (orange)
        const outerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 10)
        outerGradient.addColorStop(0, "rgba(251, 146, 60, 0.9)") // orange-400
        outerGradient.addColorStop(0.5, "rgba(239, 68, 68, 0.6)") // red-500
        outerGradient.addColorStop(1, "rgba(239, 68, 68, 0)")
        ctx.beginPath()
        ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI)
        ctx.fillStyle = outerGradient
        ctx.fill()

        // Inner fire core (yellow-orange)
        const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 5)
        innerGradient.addColorStop(0, "rgba(254, 240, 138, 1)") // yellow-200
        innerGradient.addColorStop(0.4, "rgba(251, 146, 60, 1)") // orange-400
        innerGradient.addColorStop(1, "rgba(239, 68, 68, 0.8)") // red-500
        ctx.beginPath()
        ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI)
        ctx.fillStyle = innerGradient
        ctx.fill()
      }
    }

    // Draw agents using images or fallback to circles
    if (agentImages.length === 5) {
      agentPositions.forEach(([r, c], index) => {
        const centerX = c * cellSize + cellSize / 2
        const centerY = r * cellSize + cellSize / 2
        const iconSize = Math.max(cellSize * 8, 20) // Larger size for better visibility

        // Select agent image (cycle through 5 images for variety)
        const agentImage = agentImages[index % 5]

        ctx.save()
        ctx.translate(centerX, centerY)

        ctx.drawImage(
          agentImage,
          -iconSize / 2,
          -iconSize / 2,
          iconSize,
          iconSize
        )
        ctx.restore()
      })
    } else {
      // Fallback: Draw agents as blue circles
      for (const [r, c] of agentPositions) {
        const centerX = c * cellSize + cellSize / 2
        const centerY = r * cellSize + cellSize / 2
        const radius = 6

        // Agent body
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.fillStyle = "#3b82f6" // blue-500
        ctx.fill()
        ctx.strokeStyle = "#1d4ed8" // blue-700
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Small inner highlight
        ctx.beginPath()
        ctx.arc(centerX - 1, centerY - 1, 2, 0, 2 * Math.PI)
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
        ctx.fill()
      }
    }

    // Draw hovered cell for interactive mode
    if (hoveredCell && interactive) {
      const [row, col] = hoveredCell
      ctx.fillStyle = "rgba(168, 85, 247, 0.5)" // purple with transparency
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
    }

    // Add grid lines for better visibility (optional, only for smaller grids)
    if (grid.length <= 50) {
      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 0.5
      for (let i = 0; i <= grid.length; i++) {
        ctx.beginPath()
        ctx.moveTo(0, i * cellSize)
        ctx.lineTo(canvasSize, i * cellSize)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(i * cellSize, 0)
        ctx.lineTo(i * cellSize, canvasSize)
        ctx.stroke()
      }
    }
  }, [grid, originalImage, backgroundImage, showWallOverlay, firePosition, fireMap, agentPositions, exits, hoveredCell, canvasSize, cellSize, interactive, fireIconImage, fireCellAges, agentImages])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !onCellClick) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)

    if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
      onCellClick(row, col)
    }
  }

  const handleCanvasHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)

    if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
      setHoveredCell([row, col])
    } else {
      setHoveredCell(null)
    }
  }

  const handleCanvasLeave = () => {
    setHoveredCell(null)
  }

  const wallCount = grid.flat().filter(cell => cell === 1).length
  const freeCount = grid.flat().filter(cell => cell === 0).length

  return (
    <div className="space-y-4">
      <Card className="p-4 overflow-auto">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasHover}
            onMouseLeave={handleCanvasLeave}
            className={`border border-border ${interactive ? "cursor-pointer" : ""}`}
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800 border border-border"></div>
          <span>Walls: {wallCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-border"></div>
          <span>Free Space: {freeCount.toLocaleString()}</span>
        </div>
        {exits.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 border border-border"></div>
            <span>Exits: {exits.length}</span>
          </div>
        )}
        {agentPositions.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 border border-border"></div>
            <span>Agents: {agentPositions.length}</span>
          </div>
        )}
        {(firePosition || fireMap.length > 0) && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 border border-border"></div>
            <span>Fire</span>
          </div>
        )}
      </div>
    </div>
  )
}
