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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
            <p className="text-gray-600 dark:text-gray-400">{error || 'Recipe not found'}</p>
            <Link
              href="/recipes"
              className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              Back to Recipes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const instructions = cleanInstructions(recipe.instructions);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-96">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{recipe.title}</h1>
            
            {/* Recipe Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="font-semibold text-gray-900 dark:text-white">Ready in</div>
                <div className="text-gray-600 dark:text-gray-400">{recipe.readyInMinutes} mins</div>
              </div>
              <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="font-semibold text-gray-900 dark:text-white">Servings</div>
                <div className="text-gray-600 dark:text-gray-400">{recipe.servings}</div>
              </div>
              <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="font-semibold text-gray-900 dark:text-white">Cuisine</div>
                <div className="text-gray-600 dark:text-gray-400">{recipe.cuisines.join(', ')}</div>
              </div>
              <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="font-semibold text-gray-900 dark:text-white">Diet</div>
                <div className="text-gray-600 dark:text-gray-400">{recipe.diets.join(', ')}</div>
              </div>
            </div>
            
            {/* Dietary Information */}
            <div className="mb-6 flex flex-wrap gap-2">
              {recipe.dairyFree && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm">
                  Dairy Free
                </span>
              )}
              {recipe.glutenFree && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm">
                  Gluten Free
                </span>
              )}
              {recipe.vegetarian && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm">
                  Vegetarian
                </span>
              )}
              {recipe.vegan && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm">
                  Vegan
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ingredients</h2>
                <ul className="list-disc list-inside space-y-2">
                  {recipe.extendedIngredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-300">
                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Instructions</h2>
                <ol className="list-decimal list-inside space-y-4">
                  {instructions.map((step, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-300">
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
  );
} 