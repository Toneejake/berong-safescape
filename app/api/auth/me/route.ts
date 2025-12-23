import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get user from cookie
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('bfp_user')

    if (!userCookie) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    try {
      const user = JSON.parse(userCookie.value)
      return NextResponse.json(
        { success: true, user },
        { status: 200 }
      )
    } catch (parseError) {
      // Invalid cookie format
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error('Auth check API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
