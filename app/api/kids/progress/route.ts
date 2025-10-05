import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.userId || !body.moduleId || typeof body.completed === 'undefined') {
      return NextResponse.json(
        { error: 'User ID, module ID, and completion status are required' },
        { status: 400 }
      )
    }

    // For now, we'll simulate progress tracking
    // In a real implementation, this would update the database
    const progressUpdate = {
      userId: body.userId,
      moduleId: body.moduleId,
      completed: body.completed,
      score: body.score || 0,
      completedAt: body.completed ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Progress updated successfully',
      progress: progressUpdate
    })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // For now, return sample progress data
    // In a real implementation, this would query the database
    const progress = [
      {
        userId: parseInt(userId),
        moduleId: 1,
        completed: true,
        score: 85,
        completedAt: '2025-01-15T10:30:00Z',
        updatedAt: '2025-01-15T10:30:00Z'
      },
      {
        userId: parseInt(userId),
        moduleId: 2,
        completed: false,
        score: 0,
        completedAt: null,
        updatedAt: '2025-01-15T09:00:00Z'
      }
    ]

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}
