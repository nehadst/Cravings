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
}

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  glutenFree: boolean;
  dairyFree: boolean;
  vegetarian: boolean;
  vegan: boolean;
  ketogenic: boolean;
  paleo: boolean;
  lowFodmap: boolean;
  extendedIngredients: {
    id: number;
    name: string;
    amount: number;
    unit: string;
  }[];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { preferences: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse preferences
    const dietaryPreferences: string[] = [];
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

    // Add any additional dietary preferences from the string field
    const additionalPreferences = user.preferences?.dietaryPreferences?.split(',').filter(Boolean) || [];
    dietaryPreferences.push(...additionalPreferences);

    const intolerances: string[] = user.preferences?.allergies?.split(',').filter(Boolean) || [];
    const cuisines: string[] = user.preferences?.preferredCuisines?.split(',').filter(Boolean) || [];
    const preferredIngredients: string[] = user.preferences?.preferredIngredients?.split(',').filter(Boolean) || [];
    const dislikedIngredients: string[] = user.preferences?.dislikedIngredients?.split(',').filter(Boolean) || [];

    // Get saved recipes to exclude them from recommendations
    const savedRecipes = await prisma.savedRecipe.findMany({
      where: { userId: user.id },
      select: { recipeId: true }
    });

    const savedRecipeIds = savedRecipes.map(recipe => recipe.recipeId);

    // Build query parameters for Spoonacular API
    const params = new URLSearchParams();
    params.append('apiKey', process.env.SPOONACULAR_API_KEY || '');
    params.append('number', '50'); // Get more recipes to filter through
    params.append('addRecipeInformation', 'true');
    params.append('fillIngredients', 'true');
    params.append('instructionsRequired', 'true');

    // Add dietary preferences as strict requirements
    if (dietaryPreferences.length > 0) {
      const spoonacularDiets = dietaryPreferences.map((pref: string) => {
        switch (pref) {
          case 'Gluten-Free': return 'gluten free';
          case 'Dairy-Free': return 'dairy free';
          case 'Vegetarian': return 'vegetarian';
          case 'Vegan': return 'vegan';
          case 'Keto': return 'ketogenic';
          case 'Paleo': return 'paleo';
          case 'Low FODMAP': return 'fodmap friendly';
          default: return pref.toLowerCase();
        }
      });
      params.append('diet', spoonacularDiets.join(','));
    }

    // Add intolerances as strict requirements
    if (intolerances.length > 0) {
      params.append('intolerances', intolerances.join(','));
    }

    // Add cuisines
    if (cuisines.length > 0) {
      params.append('cuisine', cuisines.join(','));
    }

    // Exclude saved recipes
    if (savedRecipeIds.length > 0) {
      params.append('excludeRecipes', savedRecipeIds.join(','));
    }

    // If there are preferred ingredients, add a query to increase chances of getting relevant recipes
    if (preferredIngredients.length > 0) {
      params.append('query', preferredIngredients.join(' ')); // This will help bias results towards these ingredients
    }

    console.log('Fetching recipes with params:', params.toString());

    // First get recipe IDs from complex search
    const searchResponse = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`
    );

    if (!searchResponse.ok) {
      console.error('Spoonacular API error:', await searchResponse.text());
      throw new Error('Failed to fetch recipes from Spoonacular');
    }

    const searchData = await searchResponse.json();
    console.log('Received recipes:', searchData.results?.length || 0);

    // Get full recipe information for each result
    const recipePromises = (searchData.results || []).map(async (result: any) => {
      const recipeResponse = await fetch(
        `https://api.spoonacular.com/recipes/${result.id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`
      );
      if (!recipeResponse.ok) return null;
      return recipeResponse.json();
    });

    const recipes = (await Promise.all(recipePromises)).filter(Boolean);
    
    // Double-check dietary preferences and ingredients
    const filteredRecipes = recipes.filter((recipe: SpoonacularRecipe) => {
      // Check dietary preferences first
      const meetsPreferences = dietaryPreferences.every((preference: string) => {
        switch (preference.toLowerCase()) {
          case 'gluten free':
            return recipe.glutenFree;
          case 'dairy free':
            return recipe.dairyFree;
          case 'vegetarian':
            return recipe.vegetarian;
          case 'vegan':
            return recipe.vegan;
          case 'ketogenic':
            return recipe.ketogenic;
          case 'paleo':
            return recipe.paleo;
          case 'low fodmap':
            return recipe.lowFodmap;
          default:
            return true; // Accept recipes if preference is not recognized
        }
      });

      if (!meetsPreferences) {
        console.log('Recipe failed preferences check:', recipe.title, 'Preferences:', dietaryPreferences, 'Recipe flags:', {
          glutenFree: recipe.glutenFree,
          dairyFree: recipe.dairyFree,
          vegetarian: recipe.vegetarian,
          vegan: recipe.vegan,
          ketogenic: recipe.ketogenic,
          paleo: recipe.paleo,
          lowFodmap: recipe.lowFodmap
        });
        return false;
      }

      // Get all ingredients and their possible variations
      const recipeIngredientTexts = recipe.extendedIngredients?.map(ing => {
        const variations = [
          ing.name.toLowerCase(),
          ing.name.toLowerCase().replace(/\s+/g, ''), // no spaces
          ...ing.name.toLowerCase().split(/[\s,-]+/) // split on spaces, commas, and hyphens
        ];
        return variations;
      }).flat() || [];

      // Check for preferred ingredients - more flexible matching
      const hasRequiredIngredients = preferredIngredients.length === 0 || 
        preferredIngredients.every((ingredient: string) => {
          const searchTerm = ingredient.toLowerCase().trim();
          return recipeIngredientTexts.some(text => 
            text.includes(searchTerm) || searchTerm.includes(text)
          );
        });

      if (!hasRequiredIngredients) {
        console.log('Recipe failed ingredients check:', recipe.title, 'Required:', preferredIngredients, 'Has:', recipeIngredientTexts);
        return false;
      }

      // Check for disliked ingredients - more flexible matching
      const hasDislikedIngredient = dislikedIngredients.some(disliked => {
        const searchTerm = disliked.toLowerCase().trim();
        return recipeIngredientTexts.some(text => 
          text.includes(searchTerm) || searchTerm.includes(text)
        );
      });

      if (hasDislikedIngredient) return false;

      // Check for allergic ingredients - more flexible matching
      const hasAllergicIngredient = intolerances.some(allergy => {
        const searchTerm = allergy.toLowerCase().trim();
        return recipeIngredientTexts.some(text => 
          text.includes(searchTerm) || searchTerm.includes(text)
        );
      });

      return !hasAllergicIngredient;
    });

    console.log('Filtered recipes:', filteredRecipes.length);

    // Return only the first 10 filtered recipes
    return NextResponse.json(filteredRecipes.slice(0, 10));
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 