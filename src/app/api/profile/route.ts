import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // In a real app, you'd get the userId from a session
    // For now, we'll create a dummy user if none exists
    let user = await prisma.user.findFirst();
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          name: 'Demo User',
        }
      });
    }
    
    // Create or update user preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        isVegan: data.isVegan,
        isVegetarian: data.isVegetarian,
        isPescatarian: data.isPescatarian,
        isKeto: data.isKeto,
        isPaleo: data.isPaleo,
        isGlutenFree: data.isGlutenFree,
        isDairyFree: data.isDairyFree,
        isNutFree: data.isNutFree,
        isHalal: data.isHalal,
        isKosher: data.isKosher,
        isLowCarb: data.isLowCarb,
        isLowFat: data.isLowFat,
        allergies: data.allergies,
        calorieTarget: data.calorieTarget,
        proteinTarget: data.proteinTarget,
        carbTarget: data.carbTarget,
        fatTarget: data.fatTarget,
        preferredCuisines: data.preferredCuisines,
        dislikedIngredients: data.dislikedIngredients,
      },
      create: {
        userId: user.id,
        isVegan: data.isVegan,
        isVegetarian: data.isVegetarian,
        isPescatarian: data.isPescatarian,
        isKeto: data.isKeto,
        isPaleo: data.isPaleo,
        isGlutenFree: data.isGlutenFree,
        isDairyFree: data.isDairyFree,
        isNutFree: data.isNutFree,
        isHalal: data.isHalal,
        isKosher: data.isKosher,
        isLowCarb: data.isLowCarb,
        isLowFat: data.isLowFat,
        allergies: data.allergies,
        calorieTarget: data.calorieTarget,
        proteinTarget: data.proteinTarget,
        carbTarget: data.carbTarget,
        fatTarget: data.fatTarget,
        preferredCuisines: data.preferredCuisines,
        dislikedIngredients: data.dislikedIngredients,
      },
    });
    
    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // In a real app, you'd get the userId from a session
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
    });
    
    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}
