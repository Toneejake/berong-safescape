"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
    Square,
    DoorOpen,
    MousePointer2,
    Trash2,
    RotateCcw,
    Download,
    Upload,
    Grid3X3,
    Loader2
} from "lucide-react"
import * as fabric from "fabric"

interface FabricFloorPlanBuilderProps {
    onExport: (pngBlob: Blob) => void
    processing?: boolean
}

type Tool = "select" | "wall" | "door"

export function FabricFloorPlanBuilder({ onExport, processing = false }: FabricFloorPlanBuilderProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fabricRef = useRef<fabric.Canvas | null>(null)
    const gridLinesRef = useRef<fabric.Line[]>([])

    const [activeTool, setActiveTool] = useState<Tool>("wall")
    const [showGrid, setShowGrid] = useState(true)
    const [wallThickness, setWallThickness] = useState(8)
    const [objectCount, setObjectCount] = useState({ walls: 0, doors: 0 })

    // Canvas dimensions
    const CANVAS_SIZE = 512
    const GRID_SIZE = 32 // 32x32 grid = 16px cells
    const CELL_SIZE = CANVAS_SIZE / GRID_SIZE

    // Colors
    const WALL_COLOR = "#1a1a1a"
    const DOOR_COLOR = "#8B4513"
    const GRID_COLOR = "#e0e0e0"
    const BACKGROUND_COLOR = "#ffffff"

    // Initialize Fabric canvas
    useEffect(() => {
        if (!canvasRef.current || fabricRef.current) return

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            backgroundColor: BACKGROUND_COLOR,
            selection: true,
        })

        fabricRef.current = canvas

        // Draw grid
        drawGrid(canvas)

        // Set up event handlers
        canvas.on("object:moving", handleObjectMoving)
        canvas.on("object:scaling", handleObjectScaling)
        canvas.on("object:modified", updateObjectCount)
        canvas.on("object:added", updateObjectCount)
        canvas.on("object:removed", updateObjectCount)

        // Mouse down for drawing
        canvas.on("mouse:down", handleMouseDown)

        return () => {
            canvas.dispose()
            fabricRef.current = null
        }
    }, [])

    // Draw grid lines
    const drawGrid = (canvas: fabric.Canvas) => {
        // Clear existing grid
        gridLinesRef.current.forEach(line => canvas.remove(line))
        gridLinesRef.current = []

        for (let i = 0; i <= GRID_SIZE; i++) {
            const pos = i * CELL_SIZE

            // Vertical line
            const vLine = new fabric.Line([pos, 0, pos, CANVAS_SIZE], {
                stroke: GRID_COLOR,
                strokeWidth: i % 4 === 0 ? 1 : 0.5,
                selectable: false,
                evented: false,
                excludeFromExport: true,
            })

            // Horizontal line
            const hLine = new fabric.Line([0, pos, CANVAS_SIZE, pos], {
                stroke: GRID_COLOR,
                strokeWidth: i % 4 === 0 ? 1 : 0.5,
                selectable: false,
                evented: false,
                excludeFromExport: true,
            })

            gridLinesRef.current.push(vLine, hLine)
            canvas.add(vLine, hLine)
            canvas.sendObjectToBack(vLine)
            canvas.sendObjectToBack(hLine)
        }
    }

    // Toggle grid visibility
    useEffect(() => {
        gridLinesRef.current.forEach(line => {
            line.set({ visible: showGrid })
        })
        fabricRef.current?.renderAll()
    }, [showGrid])

    // Snap object to grid
    const snapToGrid = (value: number): number => {
        return Math.round(value / CELL_SIZE) * CELL_SIZE
    }

    // Handle object moving (snap to grid)
    const handleObjectMoving = (e: fabric.TEvent<fabric.TPointerEvent>) => {
        const obj = e.target
        if (!obj) return

        obj.set({
            left: snapToGrid(obj.left || 0),
            top: snapToGrid(obj.top || 0),
        })
    }

    // Handle object scaling (snap dimensions)
    const handleObjectScaling = (e: fabric.TEvent<fabric.TPointerEvent>) => {
        const obj = e.target
        if (!obj || !(obj instanceof fabric.Rect)) return

        const newWidth = snapToGrid(obj.getScaledWidth())
        const newHeight = snapToGrid(obj.getScaledHeight())

        obj.set({
            width: Math.max(newWidth, CELL_SIZE),
            height: Math.max(newHeight, CELL_SIZE),
            scaleX: 1,
            scaleY: 1,
        })
    }

    // Update object count
    const updateObjectCount = useCallback(() => {
        const canvas = fabricRef.current
        if (!canvas) return

        let walls = 0
        let doors = 0

        canvas.getObjects().forEach(obj => {
            if (obj instanceof fabric.Rect) {
                if ((obj as any).objectType === "wall") walls++
                if ((obj as any).objectType === "door") doors++
            }
        })

        setObjectCount({ walls, doors })
    }, [])

    // Handle mouse down for adding objects
    const handleMouseDown = useCallback((e: fabric.TEvent<fabric.TPointerEvent>) => {
        const canvas = fabricRef.current
        if (!canvas || activeTool === "select") return

        // Don't add if clicking on an existing object
        if (e.target) return

        const pointer = canvas.getViewportPoint(e.e)
        const x = snapToGrid(pointer.x)
        const y = snapToGrid(pointer.y)

        if (activeTool === "wall") {
            const wall = new fabric.Rect({
                left: x,
                top: y,
                width: CELL_SIZE * 4,
                height: wallThickness,
                fill: WALL_COLOR,
                stroke: "#000000",
                strokeWidth: 1,
                originX: "left",
                originY: "top",
            })
                ; (wall as any).objectType = "wall"
            canvas.add(wall)
            canvas.setActiveObject(wall)
        } else if (activeTool === "door") {
            const door = new fabric.Rect({
                left: x,
                top: y,
                width: CELL_SIZE * 2,
                height: CELL_SIZE,
                fill: DOOR_COLOR,
                stroke: "#5D3A1A",
                strokeWidth: 2,
                originX: "left",
                originY: "top",
                rx: 2,
                ry: 2,
            })
                ; (door as any).objectType = "door"
            canvas.add(door)
            canvas.setActiveObject(door)
        }

        canvas.renderAll()
    }, [activeTool, wallThickness])

    // Re-attach mouse handler when tool changes
    useEffect(() => {
        const canvas = fabricRef.current
        if (!canvas) return

        canvas.off("mouse:down")
        canvas.on("mouse:down", handleMouseDown)
    }, [handleMouseDown])

    // Delete selected objects
    const deleteSelected = () => {
        const canvas = fabricRef.current
        if (!canvas) return

        const activeObjects = canvas.getActiveObjects()
        activeObjects.forEach(obj => {
            if ((obj as any).objectType) {
                canvas.remove(obj)
            }
        })
        canvas.discardActiveObject()
        canvas.renderAll()
    }

    // Clear all objects
    const clearAll = () => {
        const canvas = fabricRef.current
        if (!canvas) return

        if (!confirm("Clear all walls and doors?")) return

        const objects = canvas.getObjects().filter(obj => (obj as any).objectType)
        objects.forEach(obj => canvas.remove(obj))
        canvas.renderAll()
    }

    // Export canvas to PNG
    const handleExport = async () => {
        const canvas = fabricRef.current
        if (!canvas) return

        // Temporarily hide grid
        gridLinesRef.current.forEach(line => line.set({ visible: false }))
        canvas.discardActiveObject()
        canvas.renderAll()

        // Export to data URL
        const dataUrl = canvas.toDataURL({
            format: "png",
            multiplier: 256 / CANVAS_SIZE, // Scale to 256x256
        })

        // Restore grid
        if (showGrid) {
            gridLinesRef.current.forEach(line => line.set({ visible: true }))
        }
        canvas.renderAll()

        // Convert data URL to Blob
        const response = await fetch(dataUrl)
        const blob = await response.blob()

        onExport(blob)
    }

    const tools = [
        { id: "select" as Tool, icon: MousePointer2, label: "Select" },
        { id: "wall" as Tool, icon: Square, label: "Wall" },
        { id: "door" as Tool, icon: DoorOpen, label: "Door" },
    ]

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Grid3X3 className="h-5 w-5" />
                            Draw Floor Plan
                        </CardTitle>
                        <CardDescription>
                            Click to place walls and doors. Drag to move, resize handles to adjust size.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">{objectCount.walls} Walls</Badge>
                        <Badge variant="secondary">{objectCount.doors} Doors</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2 p-2 bg-muted rounded-lg">
                    {/* Tool buttons */}
                    <div className="flex gap-1 border-r pr-2 mr-2">
                        {tools.map(tool => (
                            <Button
                                key={tool.id}
                                variant={activeTool === tool.id ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setActiveTool(tool.id)}
                                title={tool.label}
                            >
                                <tool.icon className="h-4 w-4" />
                                <span className="ml-1 hidden sm:inline">{tool.label}</span>
                            </Button>
                        ))}
                    </div>

                    {/* Wall thickness slider */}
                    {activeTool === "wall" && (
                        <div className="flex items-center gap-2 border-r pr-2 mr-2">
                            <span className="text-xs text-muted-foreground">Thickness:</span>
                            <Slider
                                value={[wallThickness]}
                                onValueChange={([v]) => setWallThickness(v)}
                                min={4}
                                max={24}
                                step={2}
                                className="w-20"
                            />
                            <span className="text-xs w-6">{wallThickness}px</span>
                        </div>
                    )}

                    {/* Grid toggle */}
                    <Button
                        variant={showGrid ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setShowGrid(!showGrid)}
                        title="Toggle Grid"
                    >
                        <Grid3X3 className="h-4 w-4" />
                    </Button>

                    {/* Delete & Clear */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={deleteSelected}
                        title="Delete Selected"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        title="Clear All"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>

                {/* Canvas Container */}
                <div className="flex justify-center">
                    <div
                        className="border rounded-lg overflow-hidden shadow-sm"
                        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
                    >
                        <canvas ref={canvasRef} />
                    </div>
                </div>

                {/* Instructions */}
                <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Tips:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Select <strong>Wall</strong> tool and click on the canvas to add walls (black rectangles)</li>
                        <li>Select <strong>Door</strong> tool to add door openings (brown rectangles)</li>
                        <li>Drag objects to move them. Use corner handles to resize.</li>
                        <li>Walls should form room boundaries. Doors are openings where agents can pass.</li>
                    </ul>
                </div>

                {/* Export Button */}
                <Button
                    onClick={handleExport}
                    disabled={processing || (objectCount.walls === 0 && objectCount.doors === 0)}
                    className="w-full"
                    size="lg"
                >
                    {processing ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing Floor Plan...
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4 mr-2" />
                            Generate Floor Plan
                        </>
                    )}
                </Button>

                {objectCount.walls === 0 && objectCount.doors === 0 && (
                    <p className="text-sm text-amber-600 text-center">
                        ⚠️ Draw at least one wall or door before generating
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
