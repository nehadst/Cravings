import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000';

// Add delay helper function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Add session interface
interface AuthSession {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

interface UserPreferences {
  dietaryPreferences: string[];
  allergies: string[];
  cuisines: string[];
  dislikedIngredients: string[];
}

// Test user interface and data
interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
  preferences: {
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
    allergies: string;
    preferredCuisines: string;
    preferredIngredients: string;
    dislikedIngredients: string;
  };
}

// Test users with different dietary preferences
const testUsers: TestUser[] = [
  {
    id: 'test1',
    email: 'test1@example.com',
    password: 'test123',
    name: 'Test User 1',
    preferences: {
      isVegan: true,
      isVegetarian: true,
      isPescatarian: false,
      isKeto: false,
      isPaleo: false,
      isGlutenFree: false,
      isDairyFree: true,
      isNutFree: false,
      isHalal: false,
      isKosher: false,
      isLowCarb: false,
      isLowFat: false,
      allergies: 'nuts,soy',
      preferredCuisines: 'mediterranean',
      preferredIngredients: '',
      dislikedIngredients: 'mushrooms'
    }
  },
  {
    id: 'test2',
    email: 'test2@example.com',
    password: 'test123',
    name: 'Test User 2',
    preferences: {
      isVegan: false,
      isVegetarian: false,
      isPescatarian: false,
      isKeto: false,
      isPaleo: false,
      isGlutenFree: true,
      isDairyFree: true,
      isNutFree: false,
      isHalal: false,
      isKosher: false,
      isLowCarb: false,
      isLowFat: false,
      allergies: 'dairy,eggs',
      preferredCuisines: 'italian',
      preferredIngredients: '',
      dislikedIngredients: 'fish'
    }
  },
  {
    id: 'test3',
    email: 'test3@example.com',
    password: 'test123',
    name: 'Test User 3',
    preferences: {
      isVegan: false,
      isVegetarian: true,
      isPescatarian: false,
      isKeto: false,
      isPaleo: false,
      isGlutenFree: false,
      isDairyFree: false,
      isNutFree: false,
      isHalal: false,
      isKosher: false,
      isLowCarb: false,
      isLowFat: false,
      allergies: '',
      preferredCuisines: 'indian',
      preferredIngredients: '',
      dislikedIngredients: 'cilantro'
    }
  },
  {
    id: 'test4',
    email: 'test4@example.com',
    password: 'test123',
    name: 'Test User 4',
    preferences: {
      isVegan: false,
      isVegetarian: false,
      isPescatarian: false,
      isKeto: false,
      isPaleo: false,
      isGlutenFree: false,
      isDairyFree: false,
      isNutFree: false,
      isHalal: false,
      isKosher: false,
      isLowCarb: false,
      isLowFat: false,
      allergies: '',
      preferredCuisines: 'chinese',
      preferredIngredients: '',
      dislikedIngredients: ''
    }
  },
  {
    id: 'test5',
    email: 'test5@example.com',
    password: 'test123',
    name: 'Test User 5',
    preferences: {
      isVegan: true,
      isVegetarian: true,
      isPescatarian: false,
      isKeto: false,
      isPaleo: false,
      isGlutenFree: false,
      isDairyFree: true,
      isNutFree: false,
      isHalal: false,
      isKosher: false,
      isLowCarb: false,
      isLowFat: false,
      allergies: 'soy',
      preferredCuisines: 'thai',
      preferredIngredients: '',
      dislikedIngredients: 'onions'
    }
  },
  {
    id: 'test6',
    email: 'test6@example.com',
    password: 'test123',
    name: 'Test User 6',
    preferences: {
      isVegan: false,
      isVegetarian: false,
      isPescatarian: false,
      isKeto: false,
      isPaleo: false,
      isGlutenFree: true,
      isDairyFree: false,
      isNutFree: false,
      isHalal: false,
      isKosher: false,
      isLowCarb: false,
      isLowFat: false,
      allergies: 'wheat',
      preferredCuisines: 'mexican',
      preferredIngredients: '',
      dislikedIngredients: 'bell peppers'
    }
  },
  {
    id: 'test7',
    email: 'test7@example.com',
    password: 'test123',
    name: 'Test User 7',
    preferences: {
      isVegan: false,
      isVegetarian: false,
      isPescatarian: false,
      isKeto: false,
      isPaleo: false,
      isGlutenFree: false,
      isDairyFree: false,
      isNutFree: false,
      isHalal: false,
      isKosher: false,
      isLowCarb: false,
      isLowFat: false,
      allergies: '',
      preferredCuisines: 'japanese',
      preferredIngredients: '',
      dislikedIngredients: 'seaweed'
    }
  },
  {
    id: 'test8',
    email: 'test8@example.com',
    password: 'test123',
    name: 'Test User 8',
    preferences: {
      isVegan: true,
      isVegetarian: true,
      isPescatarian: false,
      isKeto: false,
      isPaleo: false,
      isGlutenFree: false,
      isDairyFree: true,
      isNutFree: false,
      isHalal: false,
      isKosher: false,
      isLowCarb: false,
      isLowFat: false,
      allergies: 'dairy',
      preferredCuisines: 'mediterranean',
      preferredIngredients: '',
      dislikedIngredients: 'olives'
    }
  },
  {
    id: 'test9',
    email: 'test9@example.com',
    password: 'test123',
    name: 'Test User 9',
    preferences: {
      isVegan: false,
      isVegetarian: false,
      isPescatarian: false,
      isKeto: false,
      isPaleo: false,
      isGlutenFree: true,
      isDairyFree: false,
      isNutFree: false,
      isHalal: false,
      isKosher: false,
      isLowCarb: false,
      isLowFat: false,
      allergies: 'gluten',
      preferredCuisines: 'italian',
      preferredIngredients: '',
      dislikedIngredients: 'anchovies'
    }
  },
  {
    id: 'test10',
    email: 'test10@example.com',
    password: 'test123',
    name: 'Test User 10',
    preferences: {
      isVegan: false,
      isVegetarian: true,
      isPescatarian: false,
      isKeto: false,
      isPaleo: false,
      isGlutenFree: true,
      isDairyFree: true,
      isNutFree: false,
      isHalal: false,
      isKosher: false,
      isLowCarb: false,
      isLowFat: false,
      allergies: 'dairy,wheat',
      preferredCuisines: 'indian',
      preferredIngredients: '',
      dislikedIngredients: 'coconut'
    }
  }
];

interface Recipe {
  id: number;
  title: string;
  cuisines: string[];
  vegan: boolean;
  vegetarian: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  diets: string[];
  ingredients: {
    name: string;
    amount: number;
    unit: string;
  }[];
}

interface VerificationResult {
  userId: string;
  email: string;
  preferences: UserPreferences;
  recipes: Recipe[];
  compliantRecipes: Recipe[];
  nonCompliantRecipes: Recipe[];
  complianceRate: number;
  errors: string[];
}

class DietaryVerificationSystem {
  private async registerUser(user: TestUser): Promise<void> {
    try {
      console.log(`\nSetting up user: ${user.email}`);
      
      // Add delay before request
      await delay(1000);
      
      // Register user
      console.log(`Registering user: ${user.email}`);
      const registerResponse = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          name: user.name
        })
      });

      if (!registerResponse.ok) {
        const errorText = await registerResponse.text();
        // If user already exists, continue with sign in
        if (errorText.includes('Email already exists')) {
          console.log(`User ${user.email} already exists, proceeding with sign in`);
        } else {
          throw new Error(`Failed to register user ${user.email}. Status: ${registerResponse.status}. Response: ${errorText}`);
        }
      } else {
        console.log(`Successfully registered new user: ${user.email}`);
      }

      // Add delay before next request
      await delay(1000);

      // Authenticate using our test endpoint
      console.log(`Authenticating user: ${user.email}`);
      const authResponse = await fetch(`${API_BASE_URL}/api/test-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });

      if (!authResponse.ok) {
        const errorText = await authResponse.text();
        throw new Error(`Failed to authenticate user ${user.email}. Status: ${authResponse.status}. Response: ${errorText}`);
      }

      const authData = await authResponse.json() as AuthSession;
      console.log(`Successfully authenticated user: ${user.email}`);

      // Add delay before next request
      await delay(1000);

      // Set preferences
      console.log(`Setting preferences for user: ${user.email}`);
      const preferences = {
        dietaryPreferences: this.getDietaryPreferences(user.preferences),
        allergies: user.preferences.allergies.split(',').filter(Boolean),
        cuisines: user.preferences.preferredCuisines.split(',').filter(Boolean),
        dislikedIngredients: user.preferences.dislikedIngredients.split(',').filter(Boolean)
      };
      
      console.log('Preferences payload:', JSON.stringify(preferences, null, 2));
      
      const preferencesResponse = await fetch(`${API_BASE_URL}/api/test-preferences`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`
        },
        body: JSON.stringify(preferences)
      });

      const preferencesData = await preferencesResponse.text();
      if (!preferencesResponse.ok) {
        throw new Error(`Failed to set preferences for user ${user.email}. Status: ${preferencesResponse.status}. Response: ${preferencesData}`);
      }

      console.log(`Successfully set preferences for user: ${user.email}`);
    } catch (error) {
      console.error(`Error setting up user ${user.email}:`, error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  }

  private getDietaryPreferences(preferences: TestUser['preferences']): string[] {
    const dietaryPreferences = [];
    if (preferences.isVegan) dietaryPreferences.push('vegan');
    if (preferences.isVegetarian) dietaryPreferences.push('vegetarian');
    if (preferences.isGlutenFree) dietaryPreferences.push('gluten free');
    if (preferences.isDairyFree) dietaryPreferences.push('dairy free');
    return dietaryPreferences;
  }

  private async getRecipesForUser(user: TestUser, authToken: string): Promise<any[]> {
    try {
      console.log(`\nFetching recipes for user: ${user.email}`);
      
      // Add delay before request
      await delay(1000);
      
      const response = await fetch(`${API_BASE_URL}/api/test-recipes`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch recipes for user ${user.email}. Status: ${response.status}. Response: ${errorText}`);
      }

      const data = await response.json() as { recipes: any[] };
      if (!data.recipes || !Array.isArray(data.recipes)) {
        throw new Error(`Invalid response format for user ${user.email}`);
      }

      console.log(`Successfully fetched ${data.recipes.length} recipes for user: ${user.email}`);
      return data.recipes;
    } catch (error) {
      console.error(`Error fetching recipes for user ${user.email}:`, error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  }

  private verifyRecipeCompliance(recipe: Recipe, user: TestUser): VerificationResult {
    const result: VerificationResult = {
      userId: user.id,
      email: user.email,
      preferences: {
        dietaryPreferences: this.getDietaryPreferences(user.preferences),
        allergies: user.preferences.allergies.split(',').filter(Boolean),
        cuisines: user.preferences.preferredCuisines.split(',').filter(Boolean),
        dislikedIngredients: user.preferences.dislikedIngredients.split(',').filter(Boolean)
      },
      recipes: [],
      compliantRecipes: [],
      nonCompliantRecipes: [],
      complianceRate: 0,
      errors: []
    };

    console.log('\n=== Recipe Verification Details ===');
    console.log(`Recipe: ${recipe.title} (ID: ${recipe.id})`);
    console.log('\nRecipe Properties:');
    console.log('- Cuisines:', recipe.cuisines);
    console.log('- Vegan:', recipe.vegan);
    console.log('- Vegetarian:', recipe.vegetarian);
    console.log('- Gluten Free:', recipe.glutenFree);
    console.log('- Dairy Free:', recipe.dairyFree);
    console.log('- Diets:', recipe.diets);
    console.log('- Ingredients:', recipe.ingredients.map(i => `${i.amount} ${i.unit} ${i.name}`).join(', '));

    console.log('\nUser Preferences:');
    console.log('- Dietary Preferences:', this.getDietaryPreferences(user.preferences));
    console.log('- Allergies:', user.preferences.allergies.split(',').filter(Boolean));
    console.log('- Preferred Cuisines:', user.preferences.preferredCuisines.split(',').filter(Boolean));
    console.log('- Disliked Ingredients:', user.preferences.dislikedIngredients.split(',').filter(Boolean));

    // Check dietary preferences
    const dietaryPreferences = this.getDietaryPreferences(user.preferences);
    if (dietaryPreferences.includes('vegan') && !recipe.vegan) {
      result.errors.push('Recipe is not vegan');
      result.nonCompliantRecipes.push(recipe);
    } else {
      result.compliantRecipes.push(recipe);
    }
    if (dietaryPreferences.includes('vegetarian') && !recipe.vegetarian) {
      result.errors.push('Recipe is not vegetarian');
      result.nonCompliantRecipes.push(recipe);
    } else {
      result.compliantRecipes.push(recipe);
    }
    if (dietaryPreferences.includes('dairy free') && !recipe.dairyFree) {
      result.errors.push('Recipe is not dairy free');
      result.nonCompliantRecipes.push(recipe);
    } else {
      result.compliantRecipes.push(recipe);
    }
    if (dietaryPreferences.includes('gluten free') && !recipe.glutenFree) {
      result.errors.push('Recipe is not gluten free');
      result.nonCompliantRecipes.push(recipe);
    } else {
      result.compliantRecipes.push(recipe);
    }

    // Check allergies
    const allergies = user.preferences.allergies.split(',').map(a => a.trim().toLowerCase());
    const hasAllergen = recipe.ingredients.some(ingredient => 
      allergies.some(allergy => ingredient.name.toLowerCase().includes(allergy))
    );
    if (hasAllergen) {
      result.errors.push('Recipe contains allergens');
      result.nonCompliantRecipes.push(recipe);
    } else {
      result.compliantRecipes.push(recipe);
    }

    // Check cuisines
    const preferredCuisines = user.preferences.preferredCuisines.split(',').map(c => c.trim().toLowerCase());
    const hasPreferredCuisine = recipe.cuisines.some(cuisine => 
      preferredCuisines.some(preferred => cuisine.toLowerCase().includes(preferred))
    );
    if (!hasPreferredCuisine) {
      result.errors.push('Recipe does not match preferred cuisines');
      result.nonCompliantRecipes.push(recipe);
    } else {
      result.compliantRecipes.push(recipe);
    }

    // Check disliked ingredients
    const dislikedIngredients = user.preferences.dislikedIngredients.split(',').map(i => i.trim().toLowerCase());
    const hasDislikedIngredient = recipe.ingredients.some(ingredient => 
      dislikedIngredients.some(disliked => ingredient.name.toLowerCase().includes(disliked))
    );
    if (hasDislikedIngredient) {
      result.errors.push('Recipe contains disliked ingredients');
      result.nonCompliantRecipes.push(recipe);
    } else {
      result.compliantRecipes.push(recipe);
    }

    console.log('\nVerification Results:');
    console.log('- Compliant:', result.compliantRecipes.length > 0);
    if (result.errors.length > 0) {
      console.log('- Failure Reasons:', result.errors.join(', '));
    }
    console.log('================================\n');

    result.recipes.push(recipe);
    return result;
  }

  public async runVerification(): Promise<{
    totalRecipes: number;
    compliantRecipes: number;
    complianceRate: number;
    results: VerificationResult[];
  }> {
    const allResults: VerificationResult[] = [];
    let totalRecipes = 0;
    let compliantRecipes = 0;

    console.log('\n=== Starting Dietary Verification ===\n');

    // Process users sequentially instead of all at once
    for (const user of testUsers) {
      try {
        console.log(`\n=== Processing User: ${user.email} ===`);
        console.log('User Preferences:');
        console.log('- Dietary Preferences:', this.getDietaryPreferences(user.preferences));
        console.log('- Allergies:', user.preferences.allergies.split(',').filter(Boolean));
        console.log('- Preferred Cuisines:', user.preferences.preferredCuisines.split(',').filter(Boolean));
        console.log('- Disliked Ingredients:', user.preferences.dislikedIngredients.split(',').filter(Boolean));
        
        // Register user and set preferences
        await this.registerUser(user);

        // Add delay before fetching recipes
        await delay(1000);

        // Authenticate to get a fresh token
        const authResponse = await fetch(`${API_BASE_URL}/api/test-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            password: user.password
          })
        });

        if (!authResponse.ok) {
          const errorText = await authResponse.text();
          throw new Error(`Failed to authenticate user ${user.email}. Status: ${authResponse.status}. Response: ${errorText}`);
        }

        const authData = await authResponse.json() as AuthSession;
        console.log(`Successfully authenticated user: ${user.email}`);

        // Get recipes for user with the correct token
        const recipes = await this.getRecipesForUser(user, authData.token);

        if (recipes.length === 0) {
          console.log(`No recipes found for user: ${user.email}`);
          continue;
        }

        // Verify each recipe
        console.log(`\nVerifying ${recipes.length} recipes for user: ${user.email}`);
        for (const recipe of recipes) {
          const result = this.verifyRecipeCompliance(recipe, user);
          allResults.push(result);
          totalRecipes++;
          if (result.compliantRecipes.length > 0) {
            compliantRecipes++;
          }
        }

        // Add delay before processing next user
        await delay(1000);
      } catch (error) {
        console.error(`\nError processing user ${user.email}:`, error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
          console.error('Stack trace:', error.stack);
        }
        // Continue with next user instead of stopping
        continue;
      }
    }

    // Calculate statistics
    const complianceRate = totalRecipes > 0 ? (compliantRecipes / totalRecipes) * 100 : 0;

    console.log('\n=== Verification Summary ===');
    console.log(`Total Users Processed: ${testUsers.length}`);
    console.log(`Total Recipes Verified: ${totalRecipes}`);
    console.log(`Compliant Recipes: ${compliantRecipes}`);
    console.log(`Compliance Rate: ${complianceRate.toFixed(2)}%`);
    console.log('===========================\n');

    // Log detailed failures if compliance rate is below 90%
    if (complianceRate < 90) {
      console.log('\nDetailed Failure Analysis:');
      const failures = allResults.filter(r => r.nonCompliantRecipes.length > 0);
      failures.forEach(failure => {
        console.log(`\nUser: ${failure.email} (ID: ${failure.userId})`);
        console.log('Non-compliant Recipes:');
        failure.nonCompliantRecipes.forEach(recipe => {
          console.log(`\n- ${recipe.title} (ID: ${recipe.id})`);
          console.log('  Failure Reasons:');
          failure.errors.forEach(reason => console.log(`    * ${reason}`));
        });
      });
    }

    return {
      totalRecipes,
      compliantRecipes,
      complianceRate,
      results: allResults
    };
  }
}

// Function to run the verification and log results
export async function runDietaryVerification(): Promise<void> {
  const verifier = new DietaryVerificationSystem();
  
  console.log('Starting dietary restrictions verification...');
  
  try {
    const results = await verifier.runVerification();
    
    console.log('\nVerification Results:');
    console.log('--------------------');
    console.log(`Total Recipes Tested: ${results.totalRecipes}`);
    console.log(`Compliant Recipes: ${results.compliantRecipes}`);
    console.log(`Compliance Rate: ${results.complianceRate.toFixed(2)}%`);
    
    // Log detailed failures if compliance rate is below 90%
    if (results.complianceRate < 90) {
      console.log('\nDetailed Failure Analysis:');
      const failures = results.results.filter(r => r.nonCompliantRecipes.length > 0);
      failures.forEach(failure => {
        console.log(`\nUser: ${failure.email} (ID: ${failure.userId})`);
        console.log('Non-compliant Recipes:');
        failure.nonCompliantRecipes.forEach(recipe => {
          console.log(`\n- ${recipe.title} (ID: ${recipe.id})`);
          console.log('  Failure Reasons:');
          failure.errors.forEach(reason => console.log(`    * ${reason}`));
        });
      });
    }
  } catch (error) {
    console.error('Verification failed:', error);
  }
}
