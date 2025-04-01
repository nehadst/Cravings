import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { searchRecipes, getRandomRecipes } from '@/services/spoonacular';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const diet = searchParams.get('diet');
    const intolerances = searchParams.get('intolerances');
    const cuisine = searchParams.get('cuisine');

    let recipes;
    if (query) {
      recipes = await searchRecipes(query, {
        dietaryPreferences: diet ? diet.split(',') : [],
        allergies: intolerances ? intolerances.split(',') : [],
        cuisines: cuisine ? cuisine.split(',') : []
      });
    } else {
      recipes = await getRandomRecipes(10, {
        dietaryPreferences: diet ? diet.split(',') : [],
        allergies: intolerances ? intolerances.split(',') : [],
        cuisines: cuisine ? cuisine.split(',') : []
      });
    }

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 