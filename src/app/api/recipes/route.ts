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

    // Parse allergies from string and convert to Spoonacular's intolerance format
    const allergies = user.preferences?.allergies?.split(',').filter(Boolean) || [];
    const intolerances = allergies.map(allergy => allergy.toLowerCase().trim());

    // Parse preferred cuisines and disliked ingredients
    const cuisines = user.preferences?.preferredCuisines?.split(',').filter(Boolean) || [];
    const dislikedIngredients = user.preferences?.dislikedIngredients?.split(',').filter(Boolean) || [];

    // Get saved recipes to exclude them from recommendations
    const savedRecipes = await prisma.savedRecipe.findMany({
      where: { userId: user.id },
      select: { recipeId: true }
    });

    const savedRecipeIds = savedRecipes.map(recipe => recipe.recipeId);

    // Build query parameters for Spoonacular API
    const params = new URLSearchParams();
    params.append('apiKey', process.env.SPOONACULAR_API_KEY || '');
    params.append('number', '20'); // Get more recipes to filter through
    params.append('addRecipeInformation', 'true');
    params.append('fillIngredients', 'true');

    // Add dietary preferences as strict requirements
    if (dietaryPreferences.length > 0) {
      params.append('diet', dietaryPreferences.join(','));
      params.append('strict', 'true');
    }

    // Add allergies as strict requirements
    if (intolerances.length > 0) {
      params.append('intolerances', intolerances.join(','));
      params.append('strict', 'true');
    }

    // Add cuisines as preferences
    if (cuisines.length > 0) {
      params.append('cuisine', cuisines.join(','));
    }

    // Exclude saved recipes
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
    
    // Filter recipes based on all requirements
    const filteredRecipes = data.recipes.filter((recipe: any) => {
      // Get all ingredients in lowercase for case-insensitive matching
      const ingredients = recipe.extendedIngredients?.map((ing: any) => 
        ing.name.toLowerCase()
      ) || [];

      // Check if recipe contains any disliked ingredients
      const hasDislikedIngredient = dislikedIngredients.some(disliked => 
        ingredients.some(ingredient => ingredient.includes(disliked.toLowerCase()))
      );

      // Check if recipe contains any preferred ingredients
      const hasPreferredIngredient = cuisines.length === 0 || cuisines.some(preferred => 
        ingredients.some(ingredient => ingredient.includes(preferred.toLowerCase()))
      );

      // Check if recipe contains any allergic ingredients
      const hasAllergicIngredient = intolerances.some(allergy => 
        ingredients.some(ingredient => ingredient.includes(allergy))
      );

      // Recipe must:
      // 1. NOT have any disliked ingredients
      // 2. Have at least one preferred ingredient (if preferences specified)
      // 3. NOT have any allergic ingredients
      return !hasDislikedIngredient && hasPreferredIngredient && !hasAllergicIngredient;
    });

    // Return only the first 10 filtered recipes
    return NextResponse.json(filteredRecipes.slice(0, 10));
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 