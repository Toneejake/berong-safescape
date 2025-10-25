import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.grid || !Array.isArray(body.grid)) {
      return NextResponse.json(
        { error: "Invalid grid data" },
        { status: 400 }
      )
    }

    // Validate constraints for PPO v1.5
    if (body.exits && body.exits.length > 40) {
      return NextResponse.json(
        { error: "Maximum 40 exits allowed (PPO v1.5 constraint)" },
        { status: 400 }
      )
    }

    if (body.agent_positions && body.agent_positions.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 agents allowed (PPO v1.5 constraint)" },
        { status: 400 }
      )
    }

    // Forward to Python backend
    const response = await fetch(`${BACKEND_URL}/run-simulation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error:", errorText)
      return NextResponse.json(
        { error: "Failed to start simulation" },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Run simulation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
