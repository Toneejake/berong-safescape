import { ENGAGEMENT_POINTS } from "@/lib/constants"

export type EngagementActivityType = 
  | "MODULE_COMPLETION"
  | "QUIZ_COMPLETION"
  | "VIDEO_WATCHED"
  | "GAME_PLAYED"
  | "SIMULATION_RUN"
  | "DAILY_LOGIN"
  | "CHAT_INTERACTION"
  | "POST_TEST_COMPLETION"
  | "READING_MATERIAL"

interface LogEngagementParams {
  activityType: EngagementActivityType
  metadata?: Record<string, any>
}

/**
 * Log engagement activity to the server
 */
export async function logEngagement({ activityType, metadata }: LogEngagementParams): Promise<boolean> {
  try {
    const response = await fetch("/api/engagement/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityType, metadata }),
    })

    if (!response.ok) {
      console.error("Failed to log engagement:", await response.text())
      return false
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error logging engagement:", error)
    return false
  }
}

/**
 * Get points for a specific activity type
 */
export function getPointsForActivity(activityType: EngagementActivityType): number {
  const pointsMap: Record<EngagementActivityType, number> = {
    MODULE_COMPLETION: ENGAGEMENT_POINTS.MODULE_COMPLETED,
    QUIZ_COMPLETION: ENGAGEMENT_POINTS.QUIZ_COMPLETED,
    VIDEO_WATCHED: ENGAGEMENT_POINTS.VIDEO_WATCHED,
    GAME_PLAYED: ENGAGEMENT_POINTS.GAME_PLAYED,
    SIMULATION_RUN: ENGAGEMENT_POINTS.GAME_PLAYED, // Use game points
    DAILY_LOGIN: ENGAGEMENT_POINTS.DAILY_LOGIN,
    CHAT_INTERACTION: 1, // Small bonus for chat
    POST_TEST_COMPLETION: ENGAGEMENT_POINTS.POST_TEST_COMPLETED,
    READING_MATERIAL: 2, // Reading bonus
  }

  return pointsMap[activityType] || 0
}

/**
 * Track module completion
 */
export async function trackModuleCompletion(moduleId: string, moduleName: string): Promise<boolean> {
  return logEngagement({
    activityType: "MODULE_COMPLETION",
    metadata: { moduleId, moduleName },
  })
}

/**
 * Track quiz completion
 */
export async function trackQuizCompletion(quizId: string, quizName: string, score: number, maxScore: number): Promise<boolean> {
  return logEngagement({
    activityType: "QUIZ_COMPLETION",
    metadata: { quizId, quizName, score, maxScore, percentage: Math.round((score / maxScore) * 100) },
  })
}

/**
 * Track video watched
 */
export async function trackVideoWatched(videoId: string, videoTitle: string, durationSeconds?: number): Promise<boolean> {
  return logEngagement({
    activityType: "VIDEO_WATCHED",
    metadata: { videoId, videoTitle, durationSeconds },
  })
}

/**
 * Track game played
 */
export async function trackGamePlayed(gameId: string, gameName: string, score?: number): Promise<boolean> {
  return logEngagement({
    activityType: "GAME_PLAYED",
    metadata: { gameId, gameName, score },
  })
}

/**
 * Track simulation run
 */
export async function trackSimulationRun(simulationId?: string, result?: string): Promise<boolean> {
  return logEngagement({
    activityType: "SIMULATION_RUN",
    metadata: { simulationId, result },
  })
}

/**
 * Track daily login
 */
export async function trackDailyLogin(): Promise<boolean> {
  return logEngagement({
    activityType: "DAILY_LOGIN",
    metadata: { timestamp: new Date().toISOString() },
  })
}

/**
 * Track chat interaction
 */
export async function trackChatInteraction(): Promise<boolean> {
  return logEngagement({
    activityType: "CHAT_INTERACTION",
    metadata: { timestamp: new Date().toISOString() },
  })
}

/**
 * Track reading material completion
 */
export async function trackReadingMaterial(materialId: string, materialTitle: string): Promise<boolean> {
  return logEngagement({
    activityType: "READING_MATERIAL",
    metadata: { materialId, materialTitle },
  })
}

/**
 * Log time spent on platform (call periodically)
 */
export async function logTimeSpent(minutes: number): Promise<boolean> {
  try {
    const response = await fetch("/api/engagement/time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes }),
    })

    return response.ok
  } catch (error) {
    console.error("Error logging time spent:", error)
    return false
  }
}

/**
 * Hook to track time spent on page
 */
export function createTimeTracker(intervalMinutes: number = 5) {
  let startTime = Date.now()
  let intervalId: NodeJS.Timeout | null = null

  const start = () => {
    startTime = Date.now()
    intervalId = setInterval(async () => {
      await logTimeSpent(intervalMinutes)
    }, intervalMinutes * 60 * 1000)
  }

  const stop = async () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    
    // Log remaining time
    const elapsed = Math.floor((Date.now() - startTime) / 60000)
    if (elapsed > 0) {
      await logTimeSpent(elapsed)
    }
  }

  return { start, stop }
}
