import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const [userId] = Buffer.from(token, 'base64').toString().split(':');

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { dietaryPreferences, allergies, cuisines, dislikedIngredients } = body;

    // Convert dietary preferences array to boolean fields
    const preferences = {
      isVegan: dietaryPreferences.includes('vegan'),
      isVegetarian: dietaryPreferences.includes('vegetarian'),
      isPescatarian: dietaryPreferences.includes('pescatarian'),
      isKeto: dietaryPreferences.includes('ketogenic'),
      isPaleo: dietaryPreferences.includes('paleo'),
      isGlutenFree: dietaryPreferences.includes('gluten free'),
      isDairyFree: dietaryPreferences.includes('dairy free'),
      isNutFree: dietaryPreferences.includes('tree nuts'),
      isHalal: dietaryPreferences.includes('halal'),
      isKosher: dietaryPreferences.includes('kosher'),
      isLowCarb: dietaryPreferences.includes('low-carb'),
      isLowFat: dietaryPreferences.includes('low-fat'),
      allergies: allergies.join(','),
      preferredCuisines: cuisines.join(','),
      dislikedIngredients: dislikedIngredients.join(',')
    };

    // First, check if preferences exist for this user
    const existingPreferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    let updatedUser;
    if (existingPreferences) {
      // Update existing preferences
      await prisma.userPreferences.update({
        where: { userId },
        data: preferences
      });
    } else {
      // Create new preferences
      await prisma.userPreferences.create({
        data: {
          ...preferences,
          userId
        }
      });
    }

    // Get the updated user with preferences
    updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('[TEST_PREFERENCES_ERROR]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
} 