import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await request.json();

    if (!items) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 });
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

    // Update the grocery list
    await prisma.groceryList.upsert({
      where: {
        userId: user.id
      },
      create: {
        userId: user.id,
        items
      },
      update: {
        items
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Grocery list updated successfully',
      groceryList: items
    });
  } catch (error) {
    console.error('Error updating grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to update grocery list' },
      { status: 500 }
    );
  }
} 