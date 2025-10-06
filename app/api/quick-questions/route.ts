import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all active quick questions ordered by category and order
    const questions = await prisma.quickQuestion.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
      ],
    });

    // Group questions by category
    const categorizedQuestions: Record<string, any[]> = {};
    
    questions.forEach((question: {
      id: number;
      category: string;
      questionText: string;
      responseText: string;
    }) => {
      const categoryKey = question.category;
      if (!categorizedQuestions[categoryKey]) {
        categorizedQuestions[categoryKey] = [];
      }
      categorizedQuestions[categoryKey].push({
        id: question.id,
        questionText: question.questionText,
        responseText: question.responseText,
        category: question.category,
      });
    });

    return NextResponse.json(categorizedQuestions);
  } catch (error) {
    console.error('Error fetching quick questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quick questions' },
      { status: 500 }
    );
  }
}
