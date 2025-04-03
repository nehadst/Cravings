import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
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

    // Check if the scheduled email exists and belongs to the user using raw SQL
    const scheduledEmail = await prisma.$queryRaw`
      SELECT * FROM "ScheduledEmail" 
      WHERE "id" = ${id} AND "userId" = ${user.id}
    `;

    if (!scheduledEmail || (Array.isArray(scheduledEmail) && scheduledEmail.length === 0)) {
      return NextResponse.json(
        { error: 'Scheduled email not found' },
        { status: 404 }
      );
    }

    // Delete the scheduled email using raw SQL
    await prisma.$executeRaw`
      DELETE FROM "ScheduledEmail" 
      WHERE "id" = ${id} AND "userId" = ${user.id}
    `;

    return NextResponse.json({
      message: 'Scheduled email cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling scheduled email:', error);
    return NextResponse.json(
      { error: 'Failed to cancel scheduled email' },
      { status: 500 }
    );
  }
} 