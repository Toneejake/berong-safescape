"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, RotateCcw, Clock, Users, Flame } from "lucide-react"
import { GridVisualization } from "@/components/grid-visualization"

interface SimulationResultsProps {
  results: {
    total_agents: number
    escaped_count: number
    burned_count: number
    time_steps: number
    agent_results: Array<{
      agent_id: number
      status: "escaped" | "burned"
      exit_time: number | null
      path_length: number
    }>
    commander_actions?: number[]
  }
  onReset: () => void
}

export function SimulationResults({ results, onReset }: SimulationResultsProps) {
  const successRate = (results.escaped_count / results.total_agents) * 100
  const isSuccess = results.escaped_count === results.total_agents

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className={isSuccess ? "border-green-500 border-2" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isSuccess ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                Simulation Complete
              </CardTitle>
              <CardDescription>
                {isSuccess
                  ? "All agents successfully evacuated!"
                  : "Some agents did not survive the evacuation"}
              </CardDescription>
            </div>
            <Badge variant={isSuccess ? "default" : "destructive"} className="text-lg px-4 py-2">
              {successRate.toFixed(1)}% Success
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <Users className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="text-2xl font-bold">{results.total_agents}</span>
              <span className="text-sm text-muted-foreground">Total Agents</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-8 w-8 mb-2 text-green-500" />
              <span className="text-2xl font-bold text-green-500">{results.escaped_count}</span>
              <span className="text-sm text-muted-foreground">Escaped</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-red-500/10 rounded-lg">
              <Flame className="h-8 w-8 mb-2 text-red-500" />
              <span className="text-2xl font-bold text-red-500">{results.burned_count}</span>
              <span className="text-sm text-muted-foreground">Casualties</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
              <Clock className="h-8 w-8 mb-2 text-muted-foreground" />
              <span className="text-2xl font-bold">{results.time_steps}</span>
              <span className="text-sm text-muted-foreground">Time Steps</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Details */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Details</CardTitle>
          <CardDescription>Individual evacuation outcomes for each agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {results.agent_results.map((agent) => (
              <div
                key={agent.agent_id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {agent.status === "escaped" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">Agent {agent.agent_id + 1}</span>
                  <Badge variant={agent.status === "escaped" ? "default" : "destructive"}>
                    {agent.status}
                  </Badge>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {agent.exit_time !== null && (
                    <span>Exit Time: {agent.exit_time}s</span>
                  )}
                  <span>Path: {agent.path_length} steps</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Commander Analysis */}
      {results.commander_actions && results.commander_actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Commander Analysis</CardTitle>
            <CardDescription>
              PPO Commander made {results.commander_actions.length} strategic decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Decisions:</span>
                <span className="font-medium">{results.commander_actions.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Unique Exit Routes:</span>
                <span className="font-medium">
                  {new Set(results.commander_actions).size}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-4">
                <p>
                  The AI commander continuously analyzed the fire spread and agent positions
                  to optimize evacuation routes in real-time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <div className="flex gap-2">
        <Button onClick={onReset} size="lg" className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Run New Simulation
        </Button>
      </div>
    </div>
  )
}
