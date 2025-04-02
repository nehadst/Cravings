import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { preferences: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Convert boolean preferences to dietary preferences array
    const dietaryPreferences = [];
    if (user.preferences?.isVegan) dietaryPreferences.push('vegan');
    if (user.preferences?.isVegetarian) dietaryPreferences.push('vegetarian');
    if (user.preferences?.isPescatarian) dietaryPreferences.push('pescatarian');
    if (user.preferences?.isKeto) dietaryPreferences.push('ketogenic');
    if (user.preferences?.isPaleo) dietaryPreferences.push('paleo');
    if (user.preferences?.isGlutenFree) dietaryPreferences.push('gluten free');
    if (user.preferences?.isDairyFree) dietaryPreferences.push('dairy free');
    if (user.preferences?.isNutFree) dietaryPreferences.push('tree nuts');
    if (user.preferences?.isHalal) dietaryPreferences.push('halal');
    if (user.preferences?.isKosher) dietaryPreferences.push('kosher');
    if (user.preferences?.isLowCarb) dietaryPreferences.push('low-carb');
    if (user.preferences?.isLowFat) dietaryPreferences.push('low-fat');

    // Parse allergies from string
    const allergies = user.preferences?.allergies?.split(',').filter(Boolean) || [];

    // Parse cuisines and ingredients from strings
    const cuisines = user.preferences?.preferredCuisines?.split(',').filter(Boolean) || [];
    const preferredIngredients = user.preferences?.preferredIngredients?.split(',').filter(Boolean) || [];
    const dislikedIngredients = user.preferences?.dislikedIngredients?.split(',').filter(Boolean) || [];

    return NextResponse.json({
      dietaryPreferences,
      allergies,
      nutritionalGoals: {
        calories: user.preferences?.calorieTarget || 2000,
        protein: user.preferences?.proteinTarget || 50,
        carbs: user.preferences?.carbTarget || 250,
        fats: user.preferences?.fatTarget || 70
      },
      cuisines,
      preferredIngredients,
      dislikedIngredients
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // First check if user exists
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Convert dietary preferences array to boolean fields and store additional preferences
    const dietaryPreferences = data.dietaryPreferences || [];
    const preferences = {
      // Boolean dietary preferences
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
      
      // Store additional preferences as strings
      dietaryPreferences: dietaryPreferences
        .filter((pref: string) => !['vegan', 'vegetarian', 'pescatarian', 'ketogenic', 'paleo', 
          'gluten free', 'dairy free', 'tree nuts', 'halal', 'kosher', 'low-carb', 'low-fat']
          .includes(pref.toLowerCase()))
        .join(','),
      
      // Handle arrays safely
      allergies: Array.isArray(data.allergies) ? data.allergies.join(',') : data.allergies || '',
      preferredCuisines: Array.isArray(data.cuisines) ? data.cuisines.join(',') : data.cuisines || '',
      preferredIngredients: Array.isArray(data.preferredIngredients) ? data.preferredIngredients.join(',') : data.preferredIngredients || '',
      dislikedIngredients: Array.isArray(data.dislikedIngredients) ? data.dislikedIngredients.join(',') : data.dislikedIngredients || '',
      
      // Handle nutritional goals
      calorieTarget: data.nutritionalGoals?.calories || 2000,
      proteinTarget: data.nutritionalGoals?.protein || 50,
      carbTarget: data.nutritionalGoals?.carbs || 250,
      fatTarget: data.nutritionalGoals?.fats || 70,
    };

    // Create or update preferences
    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...preferences
      },
      update: preferences
    });

    return NextResponse.json({ success: true, preferences: updatedPreferences });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
} 