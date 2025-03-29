'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Recipe } from '@/services/spoonacular';

interface RecipePageProps {
  params: Promise<{ id: string }>;
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
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading recipe...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            Recipe not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/recipes"
          className="inline-block text-blue-600 dark:text-blue-400 hover:underline mb-8"
        >
          ← Back to Recipes
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Recipe Header */}
          <div className="relative h-96">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {recipe.title}
            </h1>

            {/* Recipe Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Ready in</p>
                <p className="font-semibold">{recipe.readyInMinutes} mins</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Servings</p>
                <p className="font-semibold">{recipe.servings}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Cuisine</p>
                <p className="font-semibold">{recipe.cuisines.join(', ')}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Diet</p>
                <p className="font-semibold">{recipe.diets.join(', ')}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="prose dark:prose-invert max-w-none mb-8">
              <div dangerouslySetInnerHTML={{ __html: recipe.summary }} />
            </div>

            {/* Ingredients */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ingredients
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipe.extendedIngredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span>
                      {ingredient.amount} {ingredient.unit} {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Instructions
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                {recipe.instructions.split('\n').map((step, index) => (
                  <p key={index} className="mb-4">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {index + 1}.
                    </span>{' '}
                    {step}
                  </p>
                ))}
              </div>
            </div>

            {/* Dietary Information */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Dietary Information
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Vegetarian
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {recipe.vegetarian ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Vegan
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {recipe.vegan ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Gluten Free
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {recipe.glutenFree ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Dairy Free
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {recipe.dairyFree ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            </div>

            {/* Source Link */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Original Recipe →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 