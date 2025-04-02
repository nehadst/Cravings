import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Recipe } from '@/services/spoonacular';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user) {
      checkIfSaved();
    }
  }, [session, recipe.id]);

  const checkIfSaved = async () => {
    try {
      const response = await fetch('/api/recipes/saved');
      if (!response.ok) throw new Error('Failed to fetch saved recipes');
      const savedRecipes = await response.json();
      setIsSaved(savedRecipes.some((saved: any) => saved.recipeId === recipe.id));
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleSave = async () => {
    if (!session?.user) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/recipes/save', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: recipe.id,
          title: recipe.title,
          image: recipe.image,
        }),
      });

      if (!response.ok) throw new Error('Failed to save recipe');
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
        />
        {session?.user && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`absolute top-2 right-2 p-2 rounded-full ${
              isSaved
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-1000 hover:bg-gray-600'
            } text-white transition-colors`}
          >
            {isSaving ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : isSaved ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {recipe.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{recipe.usedIngredientCount} ingredients used</span>
          <span>{recipe.likes} likes</span>
        </div>
        <div className="mt-4">
          <Link
            href={`/recipes/${recipe.id}`}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            View Recipe
          </Link>
        </div>
      </div>
    </div>
  );
} 