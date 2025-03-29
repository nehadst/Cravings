'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RecipeDetails, getRecipeDetails } from '@/services/spoonacular';

interface RecipePageProps {
  params: {
    id: string;
  };
}

export default function RecipePage({ params }: RecipePageProps) {
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const recipeData = await getRecipeDetails(parseInt(params.id));
        setRecipe(recipeData);
      } catch (err) {
        setError('Failed to load recipe details');
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading recipe details...</p>
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
            <p className="text-red-600 dark:text-red-400">{error || 'Recipe not found'}</p>
            <Link
              href="/recipes"
              className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Recipes
            </Link>
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