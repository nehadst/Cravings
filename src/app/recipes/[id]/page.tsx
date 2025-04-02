'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Recipe } from '@/services/spoonacular';

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

function cleanInstructions(instructions: string): string[] {
  // Remove HTML tags and split into steps
  return instructions
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/^\d+\.\s*/, '') // Remove leading numbers
    .split('\n')
    .map(step => step.trim())
    .filter(step => step.length > 0); // Remove empty lines
}

export default function RecipePage({ params }: RecipePageProps) {
  const resolvedParams = use(params);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const response = await fetch(`/api/recipes/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error('Failed to load recipe details');
        }
        const recipeData = await response.json();
        setRecipe(recipeData);
      } catch (err) {
        setError('Failed to load recipe details');
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600">{error || 'Recipe not found'}</p>
            <Link
              href="/recipes"
              className="mt-4 inline-block text-blue-600 hover:text-blue-500"
            >
              Back to Recipes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const instructions = recipe.instructions ? cleanInstructions(recipe.instructions) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/recipes"
              className="inline-flex items-center text-gray-900 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Recipes
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">{recipe.title}</h1>
            <div className="w-8" /> {/* Spacer for visual balance */}
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative h-96">
              <Image
                src={recipe.image}
                alt={recipe.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8">
              <h2 className="text-3xl font-bold text-black mb-4">{recipe.title}</h2>
              
              {/* Recipe Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-black">Ready in</div>
                  <div className="text-gray-800">{recipe.readyInMinutes} mins</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-black">Servings</div>
                  <div className="text-gray-800">{recipe.servings}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-black">Cuisine</div>
                  <div className="text-gray-800">{recipe.cuisines.join(', ')}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-black">Diet</div>
                  <div className="text-gray-800">{recipe.diets?.join(', ') || 'Not specified'}</div>
                </div>
              </div>
              
              {/* Dietary Information */}
              <div className="flex flex-wrap gap-2 mb-6">
                {recipe.dairyFree && (
                  <span className="px-3 py-1 bg-green-100 text-green-900 rounded-full text-sm font-medium">
                    Dairy Free
                  </span>
                )}
                {recipe.glutenFree && (
                  <span className="px-3 py-1 bg-green-100 text-green-900 rounded-full text-sm font-medium">
                    Gluten Free
                  </span>
                )}
                {recipe.vegetarian && (
                  <span className="px-3 py-1 bg-green-100 text-green-900 rounded-full text-sm font-medium">
                    Vegetarian
                  </span>
                )}
                {recipe.vegan && (
                  <span className="px-3 py-1 bg-green-100 text-green-900 rounded-full text-sm font-medium">
                    Vegan
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold text-black mb-4">Ingredients</h2>
                  <ul className="list-disc list-inside space-y-2">
                    {recipe.extendedIngredients.map((ingredient, index) => (
                      <li key={index} className="text-gray-800">
                        {ingredient.amount} {ingredient.unit} {ingredient.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-black mb-4">Instructions</h2>
                  <ol className="list-decimal list-inside space-y-4">
                    {instructions.map((step, index) => (
                      <li key={index} className="text-gray-800">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 