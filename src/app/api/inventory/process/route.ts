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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { ingredients } = await request.json();

    // Use OpenAI to process and organize the ingredients
    const prompt = `
      Please process this list of ingredients and:
      1. Remove duplicates
      2. Combine similar items
      3. Standardize measurements
      4. Categorize items (e.g., Produce, Meat, Dairy, etc.)
      5. Format each item as: name, quantity, unit, category
      
      Ingredients:
      ${ingredients.join('\n')}
      
      Return the processed ingredients in JSON format like this:
      [
        {
          "name": "item name",
          "quantity": number,
          "unit": "standardized unit",
          "category": "category name"
        }
      ]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that processes and organizes ingredients. Keep the output clean and well-formatted."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const processedIngredients = JSON.parse(completion.choices[0].message.content || '[]');

    // Add each processed ingredient to the inventory
    const inventoryItems = await Promise.all(
      processedIngredients.map(async (item: any) => {
        return prisma.inventoryItem.create({
          data: {
            userId: user.id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            category: item.category
          }
        });
      })
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Ingredients processed and added to inventory',
      inventoryItems
    });
  } catch (error) {
    console.error('Error processing ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to process ingredients' },
      { status: 500 }
    );
  }
} 