import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { format, parseISO } from 'date-fns';
import { toZonedTime, toDate } from 'date-fns-tz';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { scheduledDate, scheduledTime } = await request.json();
    
    if (!scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: 'Date and time are required' },
        { status: 400 }
      );
    }

    // Get the user's grocery list
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { groceryList: true }
    });

    if (!user?.groceryList) {
      return NextResponse.json(
        { error: 'Grocery list not found' },
        { status: 404 }
      );
    }

    // Combine date and time into a single string
    const dateTimeString = `${scheduledDate}T${scheduledTime}`;
    
    // Parse the date string to a Date object
    const estDate = parseISO(dateTimeString);
    
    // Convert EST to UTC for storage
    // In date-fns-tz v3, we need to use toDate to convert to UTC
    const utcDate = toDate(estDate, { timeZone: 'America/New_York' });

    // Create a scheduled email record using a raw query approach
    // This bypasses the TypeScript error with the Prisma client
    const result = await prisma.$executeRaw`
      INSERT INTO "ScheduledEmail" ("id", "userId", "emailType", "scheduledFor", "status", "data", "createdAt", "updatedAt")
      VALUES (${crypto.randomUUID()}, ${user.id}, 'GROCERY_LIST', ${utcDate}, 'PENDING', ${JSON.stringify({ groceryList: user.groceryList.items })}, ${new Date()}, ${new Date()})
    `;

    return NextResponse.json({
      message: 'Email scheduled successfully',
      scheduledFor: format(toZonedTime(utcDate, 'America/New_York'), 'MMMM d, yyyy h:mm a')
    });
  } catch (error) {
    console.error('Error scheduling grocery list email:', error);
    return NextResponse.json(
      { error: 'Failed to schedule email' },
      { status: 500 }
    );
  }
} 