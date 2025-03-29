import { NextResponse } from 'next/server';
import { getRandomRecipes, searchRecipes } from '@/services/spoonacular';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const preferences = searchParams.get('preferences');

    console.log('API Route - Query:', query);
    console.log('API Route - Preferences:', preferences);

    let response;
    if (query) {
      console.log('Searching for recipes with query:', query);
      response = await searchRecipes(query, preferences ? JSON.parse(preferences) : undefined);
    } else {
      console.log('Getting random recipes');
      response = await getRandomRecipes(10, preferences ? JSON.parse(preferences) : undefined);
    }

    console.log('API Route - Response:', response);
    console.log('API Route - Response length:', response?.length || 0);

    // Ensure response is an array
    if (!Array.isArray(response)) {
      console.error('Invalid response format:', response);
      return NextResponse.json(
        { error: 'Invalid response format from recipe API' },
        { status: 500 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
} 