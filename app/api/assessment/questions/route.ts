import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role') || 'adult'
    const type = searchParams.get('type') || 'preTest'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Fetch questions that match the role
    const questions = await prisma.assessmentQuestion.findMany({
      where: {
        isActive: true,
        forRoles: {
          has: role,
        },
      },
      select: {
        id: true,
        question: true,
        options: true,
        category: true,
        difficulty: true,
        // Don't send correct answer to client for security
        // correctAnswer and explanation will be checked server-side
      },
      orderBy: {
        id: 'asc',
      },
      take: limit,
    })

    // Shuffle questions for variety
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5)

    return NextResponse.json({
      success: true,
      questions: shuffledQuestions,
      count: shuffledQuestions.length,
    })
  } catch (error: any) {
    console.error('Error fetching assessment questions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}
