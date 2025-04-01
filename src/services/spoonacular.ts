const BASE_URL = 'https://api.spoonacular.com/recipes';

interface SpoonacularSearchResponse {
  offset: number;
  number: number;
  results: Recipe[];
  totalResults: number;
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  aisle: string;
  image: string;
  consistency: string;
  meta: string[];
  original: string;
  originalName: string;
  nameClean: string;
  measures: {
    us: {
      amount: number;
      unitShort: string;
      unitLong: string;
    };
    metric: {
      amount: number;
      unitShort: string;
      unitLong: string;
    };
  };
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missedIngredients: Ingredient[];
  usedIngredients: Ingredient[];
  unusedIngredients: Ingredient[];
  likes: number;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  extendedIngredients: Ingredient[];
  analyzedInstructions: {
    steps: {
      number: number;
      step: string;
    }[];
  }[];
  cuisines: string[];
  glutenFree: boolean;
  dairyFree: boolean;
  vegetarian: boolean;
  vegan: boolean;
  ketogenic: boolean;
  paleo: boolean;
  lowFodmap: boolean;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface UserPreferences {
  dietaryPreferences: string[];
  allergies: string[];
  nutritionalGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  cuisines: string[];
  dislikedIngredients: string[];
}

export async function searchRecipes(query: string, preferences?: any): Promise<Recipe[]> {
  const params = new URLSearchParams({
    query,
    number: '10',
    addRecipeInformation: 'true',
    addRecipeInstructions: 'true',
    ...(preferences?.dietaryPreferences?.length && { diet: preferences.dietaryPreferences.join(',') }),
    ...(preferences?.allergies?.length && { intolerances: preferences.allergies.join(',') }),
    ...(preferences?.cuisines?.length && { cuisine: preferences.cuisines.join(',') }),
  });

  console.log('Search URL:', `${BASE_URL}/complexSearch?${params}`);
  console.log('API Key:', process.env.SPOONACULAR_API_KEY ? 'Present' : 'Missing');

  const response = await fetch(`${BASE_URL}/complexSearch?${params}`, {
    headers: {
      'x-api-key': process.env.SPOONACULAR_API_KEY || '',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch recipes');
  }

  const data: SpoonacularSearchResponse = await response.json();
  console.log('API Response:', data);
  console.log('Number of results:', data.results?.length || 0);
  
  if (!data.results || data.results.length === 0) {
    console.log('No results found in response');
    return [];
  }

  // Filter results based on all dietary preferences
  const filteredResults = data.results.filter(recipe => {
    if (!preferences?.dietaryPreferences?.length) return true;

    return preferences.dietaryPreferences.every((preference: string) => {
      switch (preference) {
        case 'Gluten-Free':
          return recipe.glutenFree;
        case 'Dairy-Free':
          return recipe.dairyFree;
        case 'Vegetarian':
          return recipe.vegetarian;
        case 'Vegan':
          return recipe.vegan;
        case 'Keto':
          return recipe.ketogenic;
        case 'Paleo':
          return recipe.paleo;
        case 'Low FODMAP':
          return recipe.lowFodmap;
        default:
          return true;
      }
    });
  });

  return filteredResults;
}

export async function getRandomRecipes(count: number = 5, preferences?: any): Promise<Recipe[]> {
  const params = new URLSearchParams({
    number: count.toString(),
    addRecipeInformation: 'true',
    addRecipeInstructions: 'true',
    ...(preferences?.dietaryPreferences?.length && { diet: preferences.dietaryPreferences.join(',') }),
    ...(preferences?.allergies?.length && { intolerances: preferences.allergies.join(',') }),
    ...(preferences?.cuisines?.length && { cuisine: preferences.cuisines.join(',') }),
  });

  const response = await fetch(`${BASE_URL}/random?${params}`, {
    headers: {
      'x-api-key': process.env.SPOONACULAR_API_KEY || '',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch random recipes');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.recipes;
}

export async function getRecipeDetails(id: number): Promise<Recipe> {
  const response = await fetch(`${BASE_URL}/${id}/information`, {
    headers: {
      'x-api-key': process.env.SPOONACULAR_API_KEY || '',
    },
  });

  if (!response.ok) {
    console.error('API Error:', response.status, response.statusText);
    throw new Error('Failed to fetch recipe details');
  }

  return response.json();
}

export async function getRecipeById(id: number): Promise<Recipe> {
  const response = await fetch(
    `https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY}`
  );
  return response.json();
} 