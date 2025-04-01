import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { preferences: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return default values if no preferences exist
    if (!user.preferences) {
      return NextResponse.json({
        dietaryPreferences: [],
        allergies: [],
        nutritionalGoals: {
          calories: 2000,
          protein: 50,
          carbs: 250,
          fats: 70
        },
        cuisines: [],
        dislikedIngredients: []
      });
    }

    // Convert boolean preferences to dietary preferences array
    const dietaryPreferences = [];
    if (user.preferences.isVegan) dietaryPreferences.push('vegan');
    if (user.preferences.isVegetarian) dietaryPreferences.push('vegetarian');
    if (user.preferences.isPescatarian) dietaryPreferences.push('pescatarian');
    if (user.preferences.isKeto) dietaryPreferences.push('ketogenic');
    if (user.preferences.isPaleo) dietaryPreferences.push('paleo');
    if (user.preferences.isGlutenFree) dietaryPreferences.push('gluten free');
    if (user.preferences.isDairyFree) dietaryPreferences.push('dairy free');
    if (user.preferences.isNutFree) dietaryPreferences.push('tree nuts');
    if (user.preferences.isHalal) dietaryPreferences.push('halal');
    if (user.preferences.isKosher) dietaryPreferences.push('kosher');
    if (user.preferences.isLowCarb) dietaryPreferences.push('low-carb');
    if (user.preferences.isLowFat) dietaryPreferences.push('low-fat');

    // Parse allergies from string
    const allergies = user.preferences.allergies?.split(',').filter(Boolean) || [];

    // Parse cuisines and disliked ingredients from strings
    const cuisines = user.preferences.preferredCuisines?.split(',').filter(Boolean) || [];
    const dislikedIngredients = user.preferences.dislikedIngredients?.split(',').filter(Boolean) || [];

    return NextResponse.json({
      dietaryPreferences,
      allergies,
      nutritionalGoals: {
        calories: user.preferences.calorieTarget || 2000,
        protein: user.preferences.proteinTarget || 50,
        carbs: user.preferences.carbTarget || 250,
        fats: user.preferences.fatTarget || 70
      },
      cuisines,
      dislikedIngredients
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Parse allergies from comma-separated string
    const allergies = body.allergies
      .split(',')
      .map((allergy: string) => allergy.trim())
      .filter(Boolean)
      .join(',');

    // Parse cuisines from comma-separated string
    const cuisines = body.preferredCuisines
      .split(',')
      .map((cuisine: string) => cuisine.trim())
      .filter(Boolean)
      .join(',');

    // Parse disliked ingredients from comma-separated string
    const dislikedIngredients = body.dislikedIngredients
      .split(',')
      .map((ingredient: string) => ingredient.trim())
      .filter(Boolean)
      .join(',');

    // Update or create preferences
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        preferences: {
          upsert: {
            create: {
              isVegan: body.isVegan,
              isVegetarian: body.isVegetarian,
              isPescatarian: body.isPescatarian,
              isKeto: body.isKeto,
              isPaleo: body.isPaleo,
              isGlutenFree: body.isGlutenFree,
              isDairyFree: body.isDairyFree,
              isNutFree: body.isNutFree,
              isHalal: body.isHalal,
              isKosher: body.isKosher,
              isLowCarb: body.isLowCarb,
              isLowFat: body.isLowFat,
              allergies,
              calorieTarget: body.calorieTarget,
              proteinTarget: body.proteinTarget,
              carbTarget: body.carbTarget,
              fatTarget: body.fatTarget,
              preferredCuisines: cuisines,
              dislikedIngredients
            },
            update: {
              isVegan: body.isVegan,
              isVegetarian: body.isVegetarian,
              isPescatarian: body.isPescatarian,
              isKeto: body.isKeto,
              isPaleo: body.isPaleo,
              isGlutenFree: body.isGlutenFree,
              isDairyFree: body.isDairyFree,
              isNutFree: body.isNutFree,
              isHalal: body.isHalal,
              isKosher: body.isKosher,
              isLowCarb: body.isLowCarb,
              isLowFat: body.isLowFat,
              allergies,
              calorieTarget: body.calorieTarget,
              proteinTarget: body.proteinTarget,
              carbTarget: body.carbTarget,
              fatTarget: body.fatTarget,
              preferredCuisines: cuisines,
              dislikedIngredients
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 