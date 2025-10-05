import { NextRequest, NextResponse } from 'next/server'
import { AuthService, type CreateUserData } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserData = await request.json()

    // Validate required fields
    if (!body.email || !body.password || !body.name || !body.age) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Validate age
    if (body.age < 1 || body.age > 120) {
      return NextResponse.json(
        { error: 'Invalid age' },
        { status: 400 }
      )
    }

    const result = await AuthService.createUser(body)

    if (result.success) {
      return NextResponse.json({
        message: 'User created successfully',
        user: result.user
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
