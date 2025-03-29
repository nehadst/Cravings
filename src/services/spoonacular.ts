const BASE_URL = 'https://api.spoonacular.com/recipes';

interface SpoonacularSearchResponse {
  offset: number;
  number: number;
  results: Recipe[];
  totalResults: number;
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  sourceName: string;
  summary: string;
  instructions: string;
  extendedIngredients: ExtendedIngredient[];
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  occasions: string[];
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  veryHealthy: boolean;
  cheap: boolean;
  veryPopular: boolean;
  sustainable: boolean;
  lowFodmap: boolean;
  weightWatcherSmartPoints: number;
  gaps: string;
  preparationMinutes: number | null;
  cookingMinutes: number | null;
  aggregateLikes: number;
  healthScore: number;
  creditsText: string;
  license: string | null;
  pricePerServing: number;
  analyzedInstructions: any[];
  originalId: number | null;
  spoonacularScore: number;
  spoonacularSourceUrl: string;
}

interface ExtendedIngredient {
  id: number;
  aisle: string;
  image: string;
  consistency: string;
  name: string;
  nameClean: string;
  original: string;
  originalName: string;
  amount: number;
  unit: string;
  meta: string[];
  measures: {
    us: Measure;
    metric: Measure;
  };
}

interface Measure {
  amount: number;
  unitShort: string;
  unitLong: string;
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

  return data.results;
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
    throw new Error('Failed to fetch recipe details');
  }

  return response.json();
} 