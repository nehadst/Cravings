import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Terminal log: Session info
    console.log('\n[SAVE RECIPE API] New request received');
    console.log('----------------------------------------');
    console.log('Session status:', {
      timestamp: new Date().toISOString(),
      authenticated: !!session,
      userEmail: session?.user?.email || 'none'
    });
    
    if (!session?.user?.email) {
      console.log('[SAVE RECIPE API] Error: Unauthorized - No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recipe = await request.json();
    
    // Terminal log: Recipe data
    console.log('\n[SAVE RECIPE API] Recipe data:');
    console.log('----------------------------------------');
    console.log(JSON.stringify(recipe, null, 2));
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    // Terminal log: User lookup
    console.log('\n[SAVE RECIPE API] User lookup result:');
    console.log('----------------------------------------');
    console.log({
      found: !!user,
      userId: user?.id,
      userEmail: user?.email
    });

    if (!user) {
      console.log('[SAVE RECIPE API] Error: User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if recipe is already saved
    const existingRecipe = await prisma.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId: recipe.id || recipe.recipeId
        }
      }
    });

    // Terminal log: Existing recipe check
    console.log('\n[SAVE RECIPE API] Existing recipe check:');
    console.log('----------------------------------------');
    console.log({
      exists: !!existingRecipe,
      recipeId: recipe.id || recipe.recipeId,
      userId: user.id
    });

    if (existingRecipe) {
      console.log('[SAVE RECIPE API] Recipe already saved');
      return NextResponse.json({ message: 'Recipe already saved' });
    }

    // Save the recipe
    const savedRecipe = await prisma.savedRecipe.create({
      data: {
        userId: user.id,
        recipeId: recipe.id || recipe.recipeId,
        title: recipe.title,
        image: recipe.image
      }
    });

    // Terminal log: Save success
    console.log('\n[SAVE RECIPE API] Recipe saved successfully:');
    console.log('----------------------------------------');
    console.log({
      savedRecipeId: savedRecipe.id,
      recipeId: savedRecipe.recipeId,
      title: savedRecipe.title
    });

    return NextResponse.json({ message: 'Recipe saved successfully' });
  } catch (error) {
    // Terminal log: Error details
    console.log('\n[SAVE RECIPE API] ERROR:');
    console.log('----------------------------------------');
    console.error('Error saving recipe:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
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