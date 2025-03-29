import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        preferences: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If no preferences exist, return default values
    if (!user.preferences) {
      return NextResponse.json({
        dietaryPreferences: [],
        allergies: [],
        nutritionalGoals: {
          calories: 2000,
          protein: 50,
          carbs: 250,
          fats: 70,
        },
        cuisines: [],
        dislikedIngredients: [],
      });
    }

    // Parse the stored strings back into arrays/objects
    const preferences = {
      dietaryPreferences: user.preferences.dietaryPreferences.split(',').filter(Boolean),
      allergies: user.preferences.allergies.split(',').filter(Boolean),
      nutritionalGoals: JSON.parse(user.preferences.nutritionalGoals),
      cuisines: user.preferences.cuisines.split(',').filter(Boolean),
      dislikedIngredients: user.preferences.dislikedIngredients.split(',').filter(Boolean),
    };

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
} 