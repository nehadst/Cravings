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

    const recipe = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if recipe is already saved
    const existingRecipe = await prisma.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId: recipe.id
        }
      }
    });

    if (existingRecipe) {
      return NextResponse.json({ message: 'Recipe already saved' });
    }

    // Save the recipe
    await prisma.savedRecipe.create({
      data: {
        userId: user.id,
        recipeId: recipe.id,
        title: recipe.title,
        image: recipe.image
      }
    });

    return NextResponse.json({ message: 'Recipe saved successfully' });
  } catch (error) {
    console.error('Error saving recipe:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipeId } = await request.json();
    if (!recipeId) {
      return NextResponse.json(
        { error: 'Missing recipe ID' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.savedRecipe.delete({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsaving recipe:', error);
    return NextResponse.json(
      { error: 'Failed to unsave recipe' },
      { status: 500 }
    );
  }
} 