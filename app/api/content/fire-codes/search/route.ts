import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Search across title, section number, and content
    const fireCodeSections = await prisma.fireCodeSection.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            content: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            sectionNum: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: { order: 'asc' },
      take: 50, // Limit results to prevent too much data
    });

    // Transform the response to match the expected format
    const transformedSections = fireCodeSections.map(section => ({
      id: section.id.toString(),
      title: section.title,
      sectionNum: section.sectionNum,
      content: section.content,
      parentSectionId: section.parentSectionId ? section.parentSectionId.toString() : null,
      order: section.order,
      createdAt: section.createdAt.toISOString(),
      updatedAt: section.updatedAt.toISOString(),
    }));

    return NextResponse.json(transformedSections);
  } catch (error) {
    console.error('Error searching fire code sections:', error);
    return NextResponse.json(
      { error: 'Failed to search fire code sections' },
      { status: 500 }
    );
  }
}
