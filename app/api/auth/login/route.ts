import { NextRequest, NextResponse } from 'next/server'
import { AuthService, type LoginCredentials } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json()

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const result = await AuthService.authenticateUser(body)

    if (result.success) {
      return NextResponse.json({
        message: 'Login successful',
        user: result.user
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
