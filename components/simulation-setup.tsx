"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GridVisualization } from "@/components/grid-visualization"
import { ArrowLeft, Play, Loader2, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SimulationSetupProps {
  grid: number[][]
  config: {
    numAgents: number
    firePosition: [number, number] | null
    agentPositions: [number, number][]
    exits: [number, number][]
  }
  onConfigUpdate: (config: Partial<SimulationSetupProps["config"]>) => void
  onRunSimulation: () => void
  onBack: () => void
  processing: boolean
}

type PlacementMode = "fire" | "agent" | "exit" | "none"

export function SimulationSetup({
  grid,
  config,
  onConfigUpdate,
  onRunSimulation,
  onBack,
  processing
}: SimulationSetupProps) {
  const [placementMode, setPlacementMode] = useState<PlacementMode>("none")
  const [autoMode, setAutoMode] = useState(true)

  const handleCellClick = (row: number, col: number) => {
    // Check if cell is valid (not a wall)
    if (grid[row][col] === 0) {
      alert("Cannot place items on walls!")
      return
    }

    if (placementMode === "fire") {
      onConfigUpdate({ firePosition: [row, col] })
      setPlacementMode("none")
    } else if (placementMode === "agent") {
      const newPositions = [...config.agentPositions, [row, col] as [number, number]]
      onConfigUpdate({ agentPositions: newPositions })
      if (newPositions.length >= config.numAgents) {
        setPlacementMode("none")
      }
    } else if (placementMode === "exit") {
      const newExits = [...config.exits, [row, col] as [number, number]]
      onConfigUpdate({ exits: newExits })
    }
  }

  const handleAutoGenerate = () => {
    // Find all free cells
    const freeCells: [number, number][] = []
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col] === 1) {
          freeCells.push([row, col])
        }
      }
    }

    if (freeCells.length === 0) {
      alert("No free cells available!")
      return
    }

    // Random fire position
    const fireIdx = Math.floor(Math.random() * freeCells.length)
    const firePos = freeCells[fireIdx]

    // Random agent positions
    const agentPos: [number, number][] = []
    for (let i = 0; i < config.numAgents; i++) {
      const idx = Math.floor(Math.random() * freeCells.length)
      agentPos.push(freeCells[idx])
    }

    // Find perimeter cells for exits (PPO v1.5 constraint: 40 exits)
    const perimeterCells: [number, number][] = []
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col] === 1) {
          const isPerimeter = 
            row === 0 || row === grid.length - 1 || 
            col === 0 || col === grid[row].length - 1
          if (isPerimeter) {
            perimeterCells.push([row, col])
          }
        }
      }
    }

    // Sample 40 exits from perimeter
    const exitCount = Math.min(40, perimeterCells.length)
    const exitPositions: [number, number][] = []
    const usedIndices = new Set<number>()
    
    while (exitPositions.length < exitCount && usedIndices.size < perimeterCells.length) {
      const idx = Math.floor(Math.random() * perimeterCells.length)
      if (!usedIndices.has(idx)) {
        exitPositions.push(perimeterCells[idx])
        usedIndices.add(idx)
      }
    }

    onConfigUpdate({
      firePosition: firePos,
      agentPositions: agentPos,
      exits: exitPositions
    })
  }

  const handleClearAll = () => {
    onConfigUpdate({
      firePosition: null,
      agentPositions: [],
      exits: []
    })
  }

  const canRunSimulation = 
    config.firePosition !== null && 
    config.agentPositions.length === config.numAgents

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Simulation</CardTitle>
        <CardDescription>
          Set up fire origin, agent positions, and exits for the evacuation simulation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Using PPO Commander v1.5 with fixed action space (40 exits, up to 5 agents).
            Auto-generate will create optimal configurations automatically.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue={autoMode ? "auto" : "manual"} onValueChange={(v) => setAutoMode(v === "auto")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="auto">Auto Generate</TabsTrigger>
            <TabsTrigger value="manual">Manual Placement</TabsTrigger>
          </TabsList>

          <TabsContent value="auto" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="numAgents">Number of Agents (1-5)</Label>
                <Input
                  id="numAgents"
                  type="number"
                  min={1}
                  max={5}
                  value={config.numAgents}
                  onChange={(e) => onConfigUpdate({ numAgents: parseInt(e.target.value) || 1 })}
                />
              </div>
              <Button onClick={handleAutoGenerate} className="w-full">
                Generate Random Configuration
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                variant={placementMode === "fire" ? "default" : "outline"}
                onClick={() => setPlacementMode(placementMode === "fire" ? "none" : "fire")}
              >
                Place Fire {config.firePosition ? "" : ""}
              </Button>
              <Button
                variant={placementMode === "agent" ? "default" : "outline"}
                onClick={() => setPlacementMode(placementMode === "agent" ? "none" : "agent")}
              >
                Place Agents ({config.agentPositions.length}/{config.numAgents})
              </Button>
              <Button
                variant={placementMode === "exit" ? "default" : "outline"}
                onClick={() => setPlacementMode(placementMode === "exit" ? "none" : "exit")}
              >
                Place Exits ({config.exits.length}/40)
              </Button>
            </div>
            <Button variant="destructive" onClick={handleClearAll} className="w-full">
              Clear All Placements
            </Button>
          </TabsContent>
        </Tabs>

        <GridVisualization
          grid={grid}
          firePosition={config.firePosition}
          agentPositions={config.agentPositions}
          exits={config.exits}
          onCellClick={handleCellClick}
          interactive={placementMode !== "none"}
        />

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} disabled={processing}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={onRunSimulation}
            disabled={!canRunSimulation || processing}
            className="flex-1"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting Simulation...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run AI Simulation
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
