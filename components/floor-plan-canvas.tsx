"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Trash2, Undo, Eye, EyeOff, Flag } from "lucide-react"

interface Exit {
  id: string
  x: number // Grid coordinate (0-255)
  y: number // Grid coordinate (0-255)
  pixelX: number // Canvas pixel coordinate
  pixelY: number // Canvas pixel coordinate
}

interface AssemblyPoint {
  x: number
  y: number
}

interface FloorPlanCanvasProps {
  originalImage: string // Base64 data URL
  grid: number[][] // 256x256 grid where 1=wall, 0=free
  gridSize: { width: number; height: number }
  exits: Exit[]
  onExitsChange: (exits: Exit[]) => void
  assemblyPoint: AssemblyPoint | null
  onAssemblyPointChange: (point: AssemblyPoint | null) => void
  mode: 'view' | 'add-exit' | 'add-assembly'
  onModeChange: (mode: 'view' | 'add-exit' | 'add-assembly') => void
}

export function FloorPlanCanvas({
  originalImage,
  grid,
  gridSize,
  exits,
  onExitsChange,
  assemblyPoint,
  onAssemblyPointChange,
  mode,
  onModeChange
}: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showOverlay, setShowOverlay] = useState(true)
  const [hoveredExit, setHoveredExit] = useState<string | null>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  // Load image
  useEffect(() => {
    const img = new window.Image()
    img.onload = () => setImage(img)
    img.src = originalImage
  }, [originalImage])

  // Draw canvas
  useEffect(() => {
    if (!canvasRef.current || !image) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = gridSize.width
    canvas.height = gridSize.height

    // Draw original image
    ctx.drawImage(image, 0, 0, gridSize.width, gridSize.height)

    // Draw red wall overlay
    if (showOverlay) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.25)'
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
          if (grid[y][x] === 1) { // Wall
            ctx.fillRect(x, y, 1, 1)
          }
        }
      }
    }

    // Draw exits as green circles with numbers
    exits.forEach((exit, index) => {
      const isHovered = hoveredExit === exit.id
      const radius = isHovered ? 8 : 6

      // Draw circle
      ctx.beginPath()
      ctx.arc(exit.x, exit.y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = isHovered ? 'rgba(34, 197, 94, 0.9)' : 'rgba(34, 197, 94, 0.7)'
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw number
      ctx.fillStyle = 'white'
      ctx.font = 'bold 10px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText((index + 1).toString(), exit.x, exit.y)
    })

    // Draw assembly point as blue flag
    if (assemblyPoint) {
      const x = assemblyPoint.x
      const y = assemblyPoint.y

      // Draw flag pole
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y - 15)
      ctx.strokeStyle = '#1e40af'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw flag
      ctx.beginPath()
      ctx.moveTo(x, y - 15)
      ctx.lineTo(x + 12, y - 10)
      ctx.lineTo(x, y - 5)
      ctx.closePath()
      ctx.fillStyle = 'rgba(59, 130, 246, 0.9)'
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw base circle
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = '#1e40af'
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw cursor crosshair if in add mode
    if (mode === 'add-exit' || mode === 'add-assembly') {
      canvas.style.cursor = 'crosshair'
    } else {
      canvas.style.cursor = 'default'
    }
  }, [image, grid, gridSize, exits, showOverlay, hoveredExit, mode, assemblyPoint])

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    // Calculate scale factor between displayed size and actual canvas size
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    // Get click position relative to canvas, accounting for scaling
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)

    // Check if clicking on assembly point to remove it
    if (assemblyPoint) {
      const distToAssembly = Math.sqrt(Math.pow(assemblyPoint.x - x, 2) + Math.pow(assemblyPoint.y - y, 2))
      if (distToAssembly <= 8) {
        onAssemblyPointChange(null)
        return
      }
    }

    // Check if clicking on existing exit
    const clickedExit = exits.find(exit => {
      const dist = Math.sqrt(Math.pow(exit.x - x, 2) + Math.pow(exit.y - y, 2))
      return dist <= 8 // Within 8 pixels
    })

    if (clickedExit) {
      // Remove exit
      onExitsChange(exits.filter(e => e.id !== clickedExit.id))
      return
    }

    // Add new exit if in add mode
    if (mode === 'add-exit') {
      // Validate: must be on free space
      if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) return
      if (grid[y][x] === 1) {
        alert('Cannot place exit on wall!')
        return
      }

      // Check if too close to existing exits
      const tooClose = exits.some(exit => {
        const dist = Math.sqrt(Math.pow(exit.x - x, 2) + Math.pow(exit.y - y, 2))
        return dist < 5
      })

      if (tooClose) {
        alert('Exit too close to another exit! Place at least 5 pixels apart.')
        return
      }

      const newExit: Exit = {
        id: crypto.randomUUID(),
        x,
        y,
        pixelX: e.clientX - rect.left,
        pixelY: e.clientY - rect.top
      }

      onExitsChange([...exits, newExit])
    }

    // Add assembly point if in add-assembly mode
    if (mode === 'add-assembly') {
      // Validate: must be on free space
      if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) return
      if (grid[y][x] === 1) {
        alert('Cannot place assembly point on wall!')
        return
      }

      onAssemblyPointChange({ x, y })
      onModeChange('view') // Auto-exit placement mode after placing
    }
  }, [exits, grid, mode, onExitsChange, assemblyPoint, onAssemblyPointChange, onModeChange])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    // Calculate scale factor between displayed size and actual canvas size
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)

    // Check if hovering over exit
    const hovered = exits.find(exit => {
      const dist = Math.sqrt(Math.pow(exit.x - x, 2) + Math.pow(exit.y - y, 2))
      return dist <= 8
    })

    setHoveredExit(hovered ? hovered.id : null)
  }, [exits])

  const handleClearAll = () => {
    if (confirm('Remove all exits?')) {
      onExitsChange([])
    }
  }

  const handleUndo = () => {
    if (exits.length > 0) {
      onExitsChange(exits.slice(0, -1))
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Floor Plan with Exit & Assembly Placement</CardTitle>
            <CardDescription>
              {mode === 'add-exit' && 'Click on the floor plan to add exits'}
              {mode === 'add-assembly' && 'Click on the floor plan to place assembly area'}
              {mode === 'view' && 'Click exits or assembly point to remove them'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={exits.length > 0 ? 'default' : 'secondary'}>
              {exits.length} Exit{exits.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant={assemblyPoint ? 'default' : 'destructive'}>
              {assemblyPoint ? '✓ Assembly Set' : '⚠ No Assembly'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={mode === 'add-exit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onModeChange(mode === 'add-exit' ? 'view' : 'add-exit')}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {mode === 'add-exit' ? 'Stop Adding' : 'Add Exit'}
            </Button>
            <Button
              variant={mode === 'add-assembly' ? 'default' : assemblyPoint ? 'outline' : 'secondary'}
              size="sm"
              onClick={() => onModeChange(mode === 'add-assembly' ? 'view' : 'add-assembly')}
            >
              <Flag className="h-4 w-4 mr-2" />
              {assemblyPoint ? 'Move Assembly' : 'Set Assembly'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={exits.length === 0}
            >
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={exits.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOverlay(!showOverlay)}
          >
            {showOverlay ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            {showOverlay ? 'Hide' : 'Show'} Walls
          </Button>
        </div>

        {/* Canvas */}
        <div className="relative border rounded-lg overflow-hidden bg-gray-100">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="max-w-full h-auto"
          />
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>🚪 <strong>Exits:</strong> Click "Add Exit" then click on doorways/openings</p>
          <p>🏁 <strong>Assembly:</strong> Click "Set Assembly" then click where evacuees should gather (outside building)</p>
          <p>🔴 <strong>Walls:</strong> Red overlay shows detected walls</p>
          <p>⚠️ <strong>Required:</strong> At least 1 exit AND 1 assembly point to continue</p>
        </div>
      </CardContent>
    </Card>
  )
}
