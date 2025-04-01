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

    // Get user preferences
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

    // Parse cuisines from string
    const cuisines = user.preferences?.preferredCuisines?.split(',').filter(Boolean) || [];

    // Get saved recipes to exclude them from recommendations
    const savedRecipes = await prisma.savedRecipe.findMany({
      where: { userId: user.id },
      select: { recipeId: true }
    });

    const savedRecipeIds = savedRecipes.map(recipe => recipe.recipeId);

    // Build query parameters for Spoonacular API
    const params = new URLSearchParams();
    params.append('apiKey', process.env.SPOONACULAR_API_KEY || '');
    params.append('number', '10'); // Get 10 recipes at a time
    params.append('addRecipeInformation', 'true');
    params.append('fillIngredients', 'true');

    if (dietaryPreferences.length > 0) {
      params.append('diet', dietaryPreferences.join(','));
    }

    if (allergies.length > 0) {
      params.append('intolerances', allergies.join(','));
    }

    if (cuisines.length > 0) {
      params.append('cuisine', cuisines.join(','));
    }

    if (savedRecipeIds.length > 0) {
      params.append('exclude', savedRecipeIds.join(','));
    }

    // Fetch recipes from Spoonacular API
    const response = await fetch(
      `https://api.spoonacular.com/recipes/random?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recipes from Spoonacular');
    }

    const data = await response.json();
    return NextResponse.json(data.recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 