import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all scheduled emails for the user using raw SQL
    const scheduledEmails = await prisma.$queryRaw`
      SELECT * FROM "ScheduledEmail" 
      WHERE "userId" = ${user.id} 
      ORDER BY "scheduledFor" DESC
    `;

    return NextResponse.json({
      scheduledEmails: scheduledEmails || []
    });
  } catch (error) {
    console.error('Error fetching scheduled emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduled emails' },
      { status: 500 }
    );
  }
} 