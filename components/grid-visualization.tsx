"use client"

import { useRef, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface GridVisualizationProps {
  grid: number[][]
  firePosition?: [number, number] | null
  agentPositions?: [number, number][]
  exits?: [number, number][]
  onCellClick?: (row: number, col: number) => void
  interactive?: boolean
}

export function GridVisualization({
  grid,
  firePosition,
  agentPositions = [],
  exits = [],
  onCellClick,
  interactive = false
}: GridVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null)

  const cellSize = 3 // pixels per cell for 256x256 grid
  const canvasSize = grid.length * cellSize

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize)

    // Draw grid
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const isWall = grid[row][col] === 0
        const isFire = firePosition && firePosition[0] === row && firePosition[1] === col
        const isAgent = agentPositions.some(([r, c]) => r === row && c === col)
        const isExit = exits.some(([r, c]) => r === row && c === col)
        const isHovered = hoveredCell && hoveredCell[0] === row && hoveredCell[1] === col

        if (isFire) {
          ctx.fillStyle = "#ef4444" // red
        } else if (isAgent) {
          ctx.fillStyle = "#3b82f6" // blue
        } else if (isExit) {
          ctx.fillStyle = "#22c55e" // green
        } else if (isWall) {
          ctx.fillStyle = "#1f2937" // dark gray
        } else {
          ctx.fillStyle = "#f3f4f6" // light gray
        }

        if (isHovered && interactive) {
          ctx.fillStyle = "#a855f7" // purple for hover
        }

        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
      }
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
  }, [grid, firePosition, agentPositions, exits, hoveredCell, canvasSize, cellSize, interactive])

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

  const wallCount = grid.flat().filter(cell => cell === 0).length
  const freeCount = grid.flat().filter(cell => cell === 1).length

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
        {firePosition && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 border border-border"></div>
            <span>Fire Origin</span>
          </div>
        )}
      </div>
    </div>
  )
}
