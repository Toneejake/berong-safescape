import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const carouselImages = await prisma.carouselImage.findMany({
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
        imageUrl: body.url, // Map the url from request to imageUrl in DB
        order: body.order || 0,
        isActive: body.isActive ?? true,
      }
    })

    // Transform the response to match the component interface
    const transformedCarousel = {
      id: newCarousel.id.toString(),
      url: newCarousel.imageUrl,
      altText: newCarousel.altText,
      title: newCarousel.title
    }

    return NextResponse.json(transformedCarousel)
  } catch (error) {
    console.error('Error creating carousel image:', error)
    return NextResponse.json(
      { error: 'Failed to create carousel image' },
      { status: 500 }
    )
  }
}
