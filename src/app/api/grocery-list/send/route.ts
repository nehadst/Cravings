import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendGroceryListEmail } from '@/services/emailjs';

export async function POST(request: Request) {
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

    if (!user.groceryList?.items) {
      return NextResponse.json({ error: 'Grocery list is empty' }, { status: 400 });
    }

    // Send email using the email service
    await sendGroceryListEmail({
      toEmail: session.user.email,
      groceryList: user.groceryList.items,
      recipeName: 'Your Grocery List'
    });

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
      message: 'Grocery list sent and cleared successfully'
    });
  } catch (error) {
    console.error('Error sending grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to send grocery list' },
      { status: 500 }
    );
  }
} 