import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface UserPreferences {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Boolean dietary preferences
  isVegan: boolean;
  isVegetarian: boolean;
  isPescatarian: boolean;
  isKeto: boolean;
  isPaleo: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isNutFree: boolean;
  isHalal: boolean;
  isKosher: boolean;
  isLowCarb: boolean;
  isLowFat: boolean;
  
  // String preferences
  dietaryPreferences: string | null;
  allergies: string | null;
  preferredCuisines: string | null;
  preferredIngredients: string | null;
  dislikedIngredients: string | null;
  
  // Nutritional goals
  calorieTarget: number | null;
  proteinTarget: number | null;
  carbTarget: number | null;
  fatTarget: number | null;

  intolerances?: string[];
  cuisines?: string[];
  savedRecipes?: string[];
}

interface SpoonacularRecipe {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  image?: string;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  ketogenic: boolean;
  paleo: boolean;
  pescatarian: boolean;
  carbs: number;
  cuisines?: string[];
  extendedIngredients: Array<{
    name: string;
  }>;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the URL and check if filters are requested
    const url = new URL(request.url);
    const applyFilters = url.searchParams.get('applyFilters') === 'true';

    // Get user preferences if logged in
    let userPreferences: UserPreferences | null = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { preferences: true }
      });
      userPreferences = user?.preferences as UserPreferences;
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      apiKey: process.env.SPOONACULAR_API_KEY || '',
      number: '50',
      addRecipeInformation: 'true',
      fillIngredients: 'true',
      instructionsRequired: 'true'
    });

    // Only add filters if applyFilters is true and user has preferences
    if (applyFilters && userPreferences) {
      // Add dietary preferences
      if (userPreferences.isVegetarian) queryParams.append('diet', 'vegetarian');
      if (userPreferences.isVegan) queryParams.append('diet', 'vegan');
      if (userPreferences.isGlutenFree) queryParams.append('diet', 'gluten free');
      if (userPreferences.isDairyFree) queryParams.append('diet', 'dairy free');
      if (userPreferences.isLowCarb) queryParams.append('diet', 'low carb');
      if (userPreferences.isKeto) queryParams.append('diet', 'ketogenic');
      if (userPreferences.isPaleo) queryParams.append('diet', 'paleo');
      if (userPreferences.isPescatarian) queryParams.append('diet', 'pescatarian');

      // Add intolerances
      if (userPreferences.intolerances && userPreferences.intolerances.length > 0) {
        queryParams.append('intolerances', userPreferences.intolerances.join(','));
      }

      // Add cuisines
      if (userPreferences.cuisines && userPreferences.cuisines.length > 0) {
        queryParams.append('cuisine', userPreferences.cuisines.join(','));
      }

      // Add saved recipes to exclude
      if (userPreferences.savedRecipes?.length) {
        queryParams.append('excludeRecipes', userPreferences.savedRecipes.join(','));
      }
    }

    console.log('Fetching recipes with params:', queryParams.toString());
    const response = await fetch(`https://api.spoonacular.com/recipes/random?${queryParams.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch recipes');
    }

    console.log('Received recipes:', data.recipes.length);

    // Only filter recipes if applyFilters is true and user has preferences
    let filteredRecipes = data.recipes as SpoonacularRecipe[];
    if (applyFilters && userPreferences) {
      filteredRecipes = data.recipes.filter((recipe: SpoonacularRecipe) => {
        // Skip recipes without required fields
        if (!recipe.id || !recipe.title || !recipe.readyInMinutes || !recipe.servings) {
          return false;
        }

        // Check dietary restrictions
        if (userPreferences.isVegetarian && !recipe.vegetarian) return false;
        if (userPreferences.isVegan && !recipe.vegan) return false;
        if (userPreferences.isGlutenFree && !recipe.glutenFree) return false;
        if (userPreferences.isDairyFree && !recipe.dairyFree) return false;
        if (userPreferences.isLowCarb && recipe.carbs > 50) return false;
        if (userPreferences.isKeto && recipe.carbs > 20) return false;
        if (userPreferences.isPaleo && !recipe.paleo) return false;
        if (userPreferences.isPescatarian && !recipe.pescatarian) return false;

        // Check intolerances
        if (userPreferences.intolerances && userPreferences.intolerances.length > 0) {
          const hasIntolerance = recipe.extendedIngredients.some(ingredient =>
            userPreferences.intolerances.some(intolerance =>
              ingredient.name.toLowerCase().includes(intolerance.toLowerCase())
            )
          );
          if (hasIntolerance) return false;
        }

        // Check cuisines
        if (userPreferences.cuisines && userPreferences.cuisines.length > 0) {
          const recipeCuisines = recipe.cuisines || [];
          const hasMatchingCuisine = recipeCuisines.some(cuisine =>
            userPreferences.cuisines.some(prefCuisine =>
              cuisine.toLowerCase().includes(prefCuisine.toLowerCase())
            )
          );
          if (!hasMatchingCuisine) return false;
        }

        return true;
      });
    }

    console.log('Filtered recipes:', filteredRecipes.length);
    return NextResponse.json(filteredRecipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 