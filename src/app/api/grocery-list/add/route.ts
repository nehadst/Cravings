import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipeId } = await request.json();

    // Fetch recipe information from Spoonacular
    const recipeResponse = await fetch(
      `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`
    );

    if (!recipeResponse.ok) {
      throw new Error('Failed to fetch recipe information');
    }

    const recipeInfo = await recipeResponse.json();
    const ingredients = recipeInfo.extendedIngredients.map((ing: any) => ing.original);

    // Get user's existing grocery list
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        groceryList: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Combine existing ingredients with new ones
    const existingIngredients = user.groceryList?.items?.split('\n').filter(Boolean) || [];
    const allIngredients = [...existingIngredients, ...ingredients];

    // Use OpenAI to process and organize the ingredients
    const prompt = `
      Please organize this grocery list by category (e.g., Produce, Meat, Dairy, etc.) and combine similar items.
      Also, standardize measurements and remove duplicates.
      Format the response as a clean, organized list with category headers.
      
      Ingredients:
      ${allIngredients.join('\n')}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that organizes grocery lists. Keep the output clean and well-formatted."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const organizedList = completion.choices[0].message.content;

    // Save the organized list to the database
    await prisma.groceryList.upsert({
      where: {
        userId: user.id
      },
      create: {
        userId: user.id,
        items: organizedList
      },
      update: {
        items: organizedList
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Grocery list updated successfully',
      groceryList: organizedList
    });
  } catch (error) {
    console.error('Error processing grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to process grocery list' },
      { status: 500 }
    );
  }
} 