"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Grid3x3, Settings, Play, Loader2, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { FloorPlanUpload } from "@/components/floor-plan-upload"
import { GridVisualization } from "@/components/grid-visualization"
import { SimulationSetup } from "@/components/simulation-setup"
import { SimulationResults } from "@/components/simulation-results"

type Stage = "upload" | "grid" | "setup" | "running" | "results"

interface SimulationData {
  imageFile: File | null
  grid: number[][] | null
  config: {
    numAgents: number
    firePosition: [number, number] | null
    agentPositions: [number, number][]
    exits: [number, number][]
  }
  jobId: string | null
  results: any | null
}

export function SimulationWizard() {
  const [stage, setStage] = useState<Stage>("upload")
  const [data, setData] = useState<SimulationData>({
    imageFile: null,
    grid: null,
    config: {
      numAgents: 5,
      firePosition: null,
      agentPositions: [],
      exits: []
    },
    jobId: null,
    results: null
  })
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const stages = [
    { id: "upload", label: "Upload Floor Plan", icon: Upload },
    { id: "grid", label: "View Grid", icon: Grid3x3 },
    { id: "setup", label: "Configure Simulation", icon: Settings },
    { id: "results", label: "View Results", icon: Play }
  ]

  const currentStageIndex = stages.findIndex(s => s.id === stage || (stage === "running" && s.id === "results"))
  const progress = ((currentStageIndex + 1) / stages.length) * 100

  const handleImageUpload = async (file: File) => {
    setProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/simulation/process-image", {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        throw new Error("Failed to process image")
      }

      const result = await response.json()
      
      setData(prev => ({
        ...prev,
        imageFile: file,
        grid: result.grid
      }))
      setStage("grid")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process image")
    } finally {
      setProcessing(false)
    }
  }

  const handleConfigUpdate = (config: Partial<SimulationData["config"]>) => {
    setData(prev => ({
      ...prev,
      config: { ...prev.config, ...config }
    }))
  }

  const handleRunSimulation = async () => {
    setProcessing(true)
    setError(null)
    setStage("running")

    try {
      // Submit simulation job
      const response = await fetch("/api/simulation/run-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grid: data.grid,
          exits: data.config.exits.length > 0 ? data.config.exits : null,
          fire_position: data.config.firePosition,
          agent_positions: data.config.agentPositions
        })
      })

      if (!response.ok) {
        throw new Error("Failed to start simulation")
      }

      const { job_id } = await response.json()
      setData(prev => ({ ...prev, jobId: job_id }))

      // Poll for results
      await pollSimulationStatus(job_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run simulation")
      setStage("setup")
    } finally {
      setProcessing(false)
    }
  }

  const pollSimulationStatus = async (jobId: string) => {
    const maxAttempts = 60
    let attempts = 0

    while (attempts < maxAttempts) {
      const response = await fetch(`/api/simulation/status/${jobId}`)
      const status = await response.json()

      if (status.status === "complete") {
        setData(prev => ({ ...prev, results: status.result }))
        setStage("results")
        return
      }

      if (status.status === "failed") {
        throw new Error(status.error || "Simulation failed")
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
    }

    throw new Error("Simulation timeout")
  }

  const handleReset = () => {
    setData({
      imageFile: null,
      grid: null,
      config: {
        numAgents: 5,
        firePosition: null,
        agentPositions: [],
        exits: []
      },
      jobId: null,
      results: null
    })
    setStage("upload")
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              {stages.map((s, idx) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-2 ${
                    idx <= currentStageIndex ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <s.icon className="h-5 w-5" />
                  <span className="text-sm font-medium hidden md:inline">{s.label}</span>
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stage Content */}
      {stage === "upload" && (
        <FloorPlanUpload onUpload={handleImageUpload} processing={processing} />
      )}

      {stage === "grid" && data.grid && (
        <Card>
          <CardHeader>
            <CardTitle>Processed Floor Plan Grid</CardTitle>
            <CardDescription>
              AI has converted your floor plan into a {data.grid.length}{data.grid[0]?.length} grid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GridVisualization grid={data.grid} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStage("upload")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Upload Different Plan
              </Button>
              <Button onClick={() => setStage("setup")}>
                Configure Simulation
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {stage === "setup" && data.grid && (
        <SimulationSetup
          grid={data.grid}
          config={data.config}
          onConfigUpdate={handleConfigUpdate}
          onRunSimulation={handleRunSimulation}
          onBack={() => setStage("grid")}
          processing={processing}
        />
      )}

      {stage === "running" && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Running Simulation...</h3>
            <p className="text-muted-foreground">
              AI is calculating optimal evacuation routes
            </p>
          </CardContent>
        </Card>
      )}

      {stage === "results" && data.results && (
        <SimulationResults results={data.results} onReset={handleReset} />
      )}
    </div>
  )
}
