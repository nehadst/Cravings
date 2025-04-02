import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        groceryList: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Clear the grocery list
    await prisma.groceryList.update({
      where: {
        userId: user.id
      },
      data: {
        items: null
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Grocery list cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to clear grocery list' },
      { status: 500 }
    );
  }
} 