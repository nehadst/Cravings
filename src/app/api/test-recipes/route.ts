import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
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

    // Get user's preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Convert user preferences to diets array
    const diets = [];
    if (user.preferences?.isVegan) diets.push('vegan');
    if (user.preferences?.isVegetarian) diets.push('vegetarian');
    if (user.preferences?.isPescatarian) diets.push('pescatarian');
    if (user.preferences?.isKeto) diets.push('ketogenic');
    if (user.preferences?.isPaleo) diets.push('paleo');
    if (user.preferences?.isGlutenFree) diets.push('gluten free');
    if (user.preferences?.isDairyFree) diets.push('dairy free');
    if (user.preferences?.isNutFree) diets.push('tree nuts');
    if (user.preferences?.isHalal) diets.push('halal');
    if (user.preferences?.isKosher) diets.push('kosher');
    if (user.preferences?.isLowCarb) diets.push('low-carb');
    if (user.preferences?.isLowFat) diets.push('low-fat');

    // For testing purposes, return a mock recipe that matches the user's preferences
    const mockRecipe = {
      id: 1,
      title: 'Test Recipe',
      cuisines: user.preferences?.preferredCuisines?.split(',').map(c => c.trim()) || ['mediterranean'],
      vegan: user.preferences?.isVegan || false,
      vegetarian: user.preferences?.isVegetarian || false,
      glutenFree: user.preferences?.isGlutenFree || false,
      dairyFree: user.preferences?.isDairyFree || false,
      diets: diets,
      ingredients: [
        {
          name: 'Test Ingredient',
          amount: 1,
          unit: 'cup'
        }
      ]
    };

    return NextResponse.json({ recipes: [mockRecipe] });
  } catch (error) {
    console.error('[TEST_RECIPES_ERROR]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
} 