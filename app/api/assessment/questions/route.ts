import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role') || 'adult'
    const type = searchParams.get('type') || 'preTest'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Fetch all active questions (SQLite doesn't support 'has' for JSON arrays)
    const allQuestions = await prisma.assessmentQuestion.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        question: true,
        options: true,
        category: true,
        difficulty: true,
        forRoles: true, // Need to fetch this for filtering
      },
      orderBy: {
        id: 'asc',
      },
    })

    // Filter questions by role in JavaScript (SQLite workaround)
    const filteredQuestions = allQuestions.filter(q => {
      const roles = q.forRoles as string[]
      return roles && roles.includes(role)
    }).map(({ forRoles, ...rest }) => rest) // Remove forRoles from response

    // Shuffle questions for variety and take the limit
    const shuffledQuestions = filteredQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)

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
