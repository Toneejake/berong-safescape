import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { NotificationService } from '@/lib/notification-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Transform the response to match the expected format
    const transformedVideos = videos.map(video => ({
      id: video.id.toString(),
      title: video.title,
      description: video.description,
      youtubeId: video.youtubeId,
      category: video.category,
      duration: video.duration,
      isActive: video.isActive
    }))

    return NextResponse.json(transformedVideos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.title || !body.youtubeId || !body.category) {
      return NextResponse.json(
        { error: 'Title, YouTube ID, and category are required' },
        { status: 400 }
      )
    }

    const newVideo = await prisma.video.create({
      data: {
        title: body.title,
        description: body.description || '',
        youtubeId: body.youtubeId,
        category: body.category,
        duration: body.duration || '',
        isActive: body.isActive ?? true,
      }
    })

    // Transform the response to match the expected format
    const transformedVideo = {
      id: newVideo.id.toString(),
      title: newVideo.title,
      description: newVideo.description,
      youtubeId: newVideo.youtubeId,
      category: newVideo.category,
      duration: newVideo.duration,
      isActive: newVideo.isActive
    }

    // Create notification for users with access to this category
    await NotificationService.createNotification({
      title: `New Video: ${body.title}`,
      message: `A new video "${body.title}" has been published in the ${body.category} section.`,
      type: 'video',
      category: body.category
    })

    return NextResponse.json(transformedVideo)
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}
