import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

// Define dietary preferences for test users
const dietaryPreferences = [
  { isVegan: true, isVegetarian: true, isPescatarian: false, isKeto: false, isPaleo: false, isGlutenFree: false, isDairyFree: true, isNutFree: false, isHalal: false, isKosher: false },
  { isVegan: false, isVegetarian: true, isPescatarian: false, isKeto: false, isPaleo: false, isGlutenFree: false, isDairyFree: false, isNutFree: false, isHalal: false, isKosher: false },
  { isVegan: false, isVegetarian: false, isPescatarian: true, isKeto: false, isPaleo: false, isGlutenFree: false, isDairyFree: false, isNutFree: false, isHalal: false, isKosher: false },
  { isVegan: false, isVegetarian: false, isPescatarian: false, isKeto: true, isPaleo: false, isGlutenFree: true, isDairyFree: false, isNutFree: false, isHalal: false, isKosher: false },
  { isVegan: false, isVegetarian: false, isPescatarian: false, isKeto: false, isPaleo: true, isGlutenFree: true, isDairyFree: true, isNutFree: false, isHalal: false, isKosher: false },
  { isVegan: false, isVegetarian: false, isPescatarian: false, isKeto: false, isPaleo: false, isGlutenFree: true, isDairyFree: false, isNutFree: true, isHalal: false, isKosher: false },
  { isVegan: false, isVegetarian: false, isPescatarian: false, isKeto: false, isPaleo: false, isGlutenFree: false, isDairyFree: true, isNutFree: true, isHalal: false, isKosher: false },
  { isVegan: false, isVegetarian: false, isPescatarian: false, isKeto: false, isPaleo: false, isGlutenFree: false, isDairyFree: false, isNutFree: false, isHalal: true, isKosher: false },
  { isVegan: false, isVegetarian: false, isPescatarian: false, isKeto: false, isPaleo: false, isGlutenFree: false, isDairyFree: false, isNutFree: false, isHalal: false, isKosher: true },
  { isVegan: false, isVegetarian: false, isPescatarian: false, isKeto: false, isPaleo: false, isGlutenFree: false, isDairyFree: false, isNutFree: false, isHalal: false, isKosher: false }
];

// Define dietary restrictions and their incompatible ingredients
const dietaryRestrictions = {
  isVegan: ['meat', 'chicken', 'beef', 'pork', 'fish', 'egg', 'dairy', 'milk', 'cheese', 'butter', 'cream', 'honey'],
  isVegetarian: ['meat', 'chicken', 'beef', 'pork', 'fish'],
  isPescatarian: ['meat', 'chicken', 'beef', 'pork'],
  isKeto: ['sugar', 'flour', 'bread', 'pasta', 'rice', 'potato', 'corn'],
  isPaleo: ['sugar', 'flour', 'bread', 'pasta', 'rice', 'dairy', 'milk', 'cheese', 'processed'],
  isGlutenFree: ['flour', 'bread', 'pasta', 'wheat', 'barley', 'rye', 'gluten'],
  isDairyFree: ['dairy', 'milk', 'cheese', 'butter', 'cream', 'yogurt'],
  isNutFree: ['peanut', 'almond', 'cashew', 'walnut', 'pecan', 'hazelnut', 'nut'],
  isHalal: ['pork', 'alcohol', 'gelatin'],
  isKosher: ['pork', 'shellfish', 'mixing meat and dairy']
};

// Function to check if a recipe is compliant with dietary restrictions
function isRecipeCompliant(recipe: any, preferences: any): boolean {
  const recipeText = recipe.title.toLowerCase();
  
  for (const [restriction, incompatibleIngredients] of Object.entries(dietaryRestrictions)) {
    if (!preferences[restriction]) continue;
    
    if (incompatibleIngredients.some(ingredient => recipeText.includes(ingredient))) {
      return false;
    }
  }
  
  return true;
}

// Base recipe data
const baseRecipes = [
  {
    title: 'Spaghetti Carbonara',
    image: 'https://spoonacular.com/recipeImages/716429-556x370.jpg',
    ingredients: ['spaghetti', 'eggs', 'pecorino cheese', 'guanciale', 'black pepper'],
    instructions: 'Cook pasta, mix eggs and cheese, combine with hot pasta, add guanciale, season with pepper'
  },
  {
    title: 'Chicken Stir Fry',
    image: 'https://spoonacular.com/recipeImages/716429-556x370.jpg',
    ingredients: ['chicken breast', 'broccoli', 'soy sauce', 'garlic', 'ginger'],
    instructions: 'Cut chicken, prepare sauce, stir fry chicken, add vegetables, pour sauce'
  },
  {
    title: 'Vegetable Curry',
    image: 'https://spoonacular.com/recipeImages/716429-556x370.jpg',
    ingredients: ['onions', 'garlic', 'ginger', 'curry powder', 'coconut milk', 'mixed vegetables'],
    instructions: 'Sauté aromatics, add spices, pour coconut milk, simmer with vegetables'
  },
  {
    title: 'Salmon with Roasted Vegetables',
    image: 'https://spoonacular.com/recipeImages/716429-556x370.jpg',
    ingredients: ['salmon fillet', 'broccoli', 'carrots', 'olive oil', 'lemon'],
    instructions: 'Season salmon, prepare vegetables, roast together, serve with lemon'
  },
  {
    title: 'Quinoa Buddha Bowl',
    image: 'https://spoonacular.com/recipeImages/716429-556x370.jpg',
    ingredients: ['quinoa', 'chickpeas', 'avocado', 'kale', 'tahini dressing'],
    instructions: 'Cook quinoa, prepare vegetables, assemble bowl, drizzle with dressing'
  }
];

async function main() {
  try {
    console.log('Starting test data generation...');
    
    // Delete all existing recipes
    console.log('Deleting all existing recipes...');
    await prisma.savedRecipe.deleteMany({});
    console.log('All existing recipes deleted');
    
    // Find existing test users
    console.log('Finding existing test users...');
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          startsWith: 'test-user-'
        }
      },
      include: {
        preferences: true,
        savedRecipes: true
      }
    });
    
    if (testUsers.length === 0) {
      console.log('No test users found. Please create test users first.');
      return;
    }
    
    console.log(`Found ${testUsers.length} existing test users`);
    
    // Base recipe data
    const baseRecipes = [
      {
        title: 'Spaghetti Carbonara',
        ingredients: ['pasta', 'eggs', 'pecorino cheese', 'guanciale', 'black pepper'],
        instructions: 'Cook pasta, mix with eggs and cheese, add guanciale',
        cookingTime: 30,
        servings: 4
      },
      {
        title: 'Chicken Stir Fry',
        ingredients: ['chicken breast', 'soy sauce', 'vegetables', 'rice'],
        instructions: 'Stir fry chicken and vegetables, serve with rice',
        cookingTime: 25,
        servings: 4
      }
    ];
    
    // Create recipes for each user
    for (const user of testUsers) {
      console.log(`Creating recipes for user: ${user.email}`);
      
      // Calculate user offset to ensure unique recipe IDs
      const userOffset = (parseInt(user.email.split('-')[2]) - 1) * 100;
      
      // Create 100 recipes for this user
      for (let i = 0; i < 100; i++) {
        const baseRecipe = baseRecipes[i % baseRecipes.length];
        const recipeId = userOffset + i + 1;
        
        // Create variations of the base recipe
        const recipe = {
          title: `${baseRecipe.title} Variation ${recipeId}`,
          ingredients: baseRecipe.ingredients,
          instructions: baseRecipe.instructions,
          cookingTime: baseRecipe.cookingTime + Math.floor(Math.random() * 10),
          servings: baseRecipe.servings + Math.floor(Math.random() * 2)
        };
        
        // Check if this recipe is compliant with user's dietary preferences
        const isCompliant = isRecipeCompliant(recipe, user.preferences);
        
        // Save the recipe
        await prisma.savedRecipe.create({
          data: {
            userId: user.id,
            recipeId: recipeId,
            title: recipe.title,
            image: `https://source.unsplash.com/random/400x300/?food,${recipe.title.replace(/\s+/g, ',')}`,
            isCompliant: isCompliant
          } as any // Type assertion to bypass the linter error temporarily
        });
      }
      
      // Delete existing grocery list for this user
      await prisma.groceryList.deleteMany({
        where: { userId: user.id }
      });
      
      // Create a grocery list for this user
      await prisma.groceryList.create({
        data: {
          userId: user.id,
          items: JSON.stringify([
            { name: 'Test Item 1', amount: '1', unit: 'piece' },
            { name: 'Test Item 2', amount: '2', unit: 'cups' }
          ])
        }
      });
    }
    
    // Save test data reference
    const testData = {
      users: testUsers.map(user => ({
        id: user.id,
        email: user.email,
        preferences: user.preferences
      }))
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'test-data.json'),
      JSON.stringify(testData, null, 2)
    );
    
    console.log('Test data generation completed successfully!');
  } catch (error) {
    console.error('Error generating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 