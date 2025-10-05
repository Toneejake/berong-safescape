import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.title || !body.alt || !body.url) {
      return NextResponse.json(
        { error: 'Title, alt text, and URL are required' },
        { status: 400 }
      )
    }

    const newCarousel = await prisma.carouselImage.create({
      data: {
        title: body.title,
        altText: body.alt,
        imageUrl: body.url,
        order: 0,
        isActive: true,
      }
    })

    return NextResponse.json(newCarousel)
  } catch (error) {
    console.error('Error creating carousel image:', error)
    return NextResponse.json(
      { error: 'Failed to create carousel image' },
      { status: 500 }
    )
  }
}
