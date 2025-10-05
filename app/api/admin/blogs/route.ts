import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.title || !body.excerpt || !body.content || !body.authorId) {
      return NextResponse.json(
        { error: 'Title, excerpt, content, and author ID are required' },
        { status: 400 }
      )
    }

    const newBlog = await prisma.blogPost.create({
      data: {
        title: body.title,
        excerpt: body.excerpt,
        content: body.content,
        imageUrl: body.imageUrl || null,
        category: body.category,
        authorId: body.authorId,
        isPublished: true,
      }
    })

    return NextResponse.json(newBlog)
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
