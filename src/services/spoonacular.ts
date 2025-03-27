const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

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
}

interface Ingredient {
  id: number;
  amount: number;
  unit: string;
  unitLong: string;
  unitShort: string;
  aisle: string;
  name: string;
  original: string;
  originalName: string;
  meta: string[];
  image: string;
}

export interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  sourceUrl: string;
  summary: string;
  instructions: string;
  extendedIngredients: ExtendedIngredient[];
  diets: string[];
  cuisines: string[];
  dishTypes: string[];
  nutrition: Nutrition;
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

interface Nutrition {
  nutrients: Nutrient[];
}

interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  percentOfDailyNeeds: number;
}

export async function searchRecipes(query: string, preferences?: {
  diet?: string[];
  intolerances?: string[];
  cuisine?: string[];
  type?: string;
  maxReadyTime?: number;
  minCalories?: number;
  maxCalories?: number;
}): Promise<Recipe[]> {
  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY!,
    query,
    number: '10',
    addRecipeInformation: 'true',
    ...(preferences?.diet && { diet: preferences.diet.join(',') }),
    ...(preferences?.intolerances && { intolerances: preferences.intolerances.join(',') }),
    ...(preferences?.cuisine && { cuisine: preferences.cuisine.join(',') }),
    ...(preferences?.type && { type: preferences.type }),
    ...(preferences?.maxReadyTime && { maxReadyTime: preferences.maxReadyTime.toString() }),
    ...(preferences?.minCalories && { minCalories: preferences.minCalories.toString() }),
    ...(preferences?.maxCalories && { maxCalories: preferences.maxCalories.toString() }),
  });

  const response = await fetch(`${BASE_URL}/complexSearch?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch recipes');
  }

  const data = await response.json();
  return data.results;
}

export async function getRecipeDetails(id: number): Promise<RecipeDetails> {
  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY!,
  });

  const response = await fetch(`${BASE_URL}/${id}/information?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch recipe details');
  }

  return response.json();
}

export async function getRandomRecipes(count: number = 5): Promise<Recipe[]> {
  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY!,
    number: count.toString(),
  });

  const response = await fetch(`${BASE_URL}/random?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch random recipes');
  }

  return response.json();
} 