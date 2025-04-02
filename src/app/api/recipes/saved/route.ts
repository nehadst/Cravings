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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        savedRecipes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get full recipe information for each saved recipe with better error handling
    const recipesWithInfo = await Promise.all(
      user.savedRecipes.map(async (savedRecipe) => {
        try {
          // Add a small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const recipeResponse = await fetch(
            `https://api.spoonacular.com/recipes/${savedRecipe.recipeId}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`
          );
          
          if (!recipeResponse.ok) {
            // If we hit rate limit, return basic recipe info without ingredients
            if (recipeResponse.status === 429) {
              console.warn(`Rate limit hit for recipe ${savedRecipe.recipeId}, returning basic info`);
              return {
                id: savedRecipe.id,
                recipeId: savedRecipe.recipeId,
                title: savedRecipe.title,
                image: savedRecipe.image,
                ingredients: [] // Empty array instead of null
              };
            }
            console.error(`Failed to fetch recipe ${savedRecipe.recipeId}:`, await recipeResponse.text());
            return {
              id: savedRecipe.id,
              recipeId: savedRecipe.recipeId,
              title: savedRecipe.title,
              image: savedRecipe.image,
              ingredients: [] // Empty array instead of null
            };
          }

          const recipeInfo = await recipeResponse.json();
          
          return {
            id: savedRecipe.id,
            recipeId: savedRecipe.recipeId,
            title: savedRecipe.title,
            image: savedRecipe.image,
            ingredients: recipeInfo.extendedIngredients.map((ing: any) => ({
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
              original: ing.original
            }))
          };
        } catch (error) {
          console.error(`Error fetching recipe ${savedRecipe.recipeId}:`, error);
          // Return basic recipe info if fetch fails
          return {
            id: savedRecipe.id,
            recipeId: savedRecipe.recipeId,
            title: savedRecipe.title,
            image: savedRecipe.image,
            ingredients: [] // Empty array instead of null
          };
        }
      })
    );

    return NextResponse.json({ recipes: recipesWithInfo });
  } catch (error) {
    console.error('Error fetching saved recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 