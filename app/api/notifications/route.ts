import { NextResponse } from 'next/server';
import { NotificationService } from '@/lib/notification-service';
import { prisma } from '@/lib/prisma';
import { ContentCategory } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const numericUserId = parseInt(userId);
    if (isNaN(numericUserId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const result = await NotificationService.getUserNotifications(numericUserId);

    if (result.success) {
      return NextResponse.json(result.notifications);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, type, category, userIds } = body;

    if (!title || !message || !type || !category) {
      return NextResponse.json(
        { error: 'Title, message, type, and category are required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['kids', 'adult', 'professional'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be kids, adult, or professional' },
        { status: 400 }
      );
    }

    const result = await NotificationService.createNotification({
      title,
      message,
      type,
      category: category as ContentCategory,
      userIds
    });

    if (result.success) {
      return NextResponse.json(result.notifications);
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
