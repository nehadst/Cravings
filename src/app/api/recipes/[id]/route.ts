import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const response = await fetch(
      `https://api.spoonacular.com/recipes/${resolvedParams.id}/information`,
      {
        headers: {
          'x-api-key': process.env.SPOONACULAR_API_KEY || '',
        },
      }
    );

    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch recipe details' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe details' },
      { status: 500 }
    );
  }
} 