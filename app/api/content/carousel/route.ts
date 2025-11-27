import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const carouselImages = await prisma.carouselImage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    // Transform the database response to match the component interface
    const transformedImages = carouselImages.map(image => ({
      id: image.id.toString(), // Ensure id is a string
      url: image.imageUrl,     // Map imageUrl to url
      altText: image.altText,
      title: image.title
    }))

    return NextResponse.json(transformedImages)
  } catch (error) {
    console.error('Error fetching carousel images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch carousel images' },
      { status: 500 }
    )
  }
}
