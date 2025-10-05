import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid carousel image ID' },
        { status: 400 }
      )
    }

    await prisma.carouselImage.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Carousel image deleted successfully' })
  } catch (error) {
    console.error('Error deleting carousel image:', error)
    return NextResponse.json(
      { error: 'Failed to delete carousel image' },
      { status: 500 }
    )
  }
}
