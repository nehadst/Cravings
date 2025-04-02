'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageBackground from '@/components/PageBackground';
import Image from 'next/image';

interface SavedRecipe {
  id: string;
  recipeId: number;
  title: string;
  image: string;
  ingredients: {
    name: string;
    amount: number;
    unit: string;
    original: string;
  }[];
}

export default function SavedRecipesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIngredients, setProcessingIngredients] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchSavedRecipes();
    }
  }, [status, router]);

  const fetchSavedRecipes = async () => {
    try {
      const response = await fetch('/api/recipes/saved');
      if (!response.ok) {
        throw new Error('Failed to fetch saved recipes');
      }
      const data = await response.json();
      setRecipes(data.recipes);
    } catch (err) {
      setError('Failed to load saved recipes');
      console.error('Error fetching saved recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGroceryList = async (recipe: SavedRecipe) => {
    try {
      setProcessingIngredients(recipe.id);
      const response = await fetch('/api/grocery-list/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId: recipe.recipeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add ingredients to grocery list');
      }

      const data = await response.json();
      alert('Ingredients added to grocery list!\n\nOrganized List:\n' + data.groceryList);
    } catch (err) {
      console.error('Error adding to grocery list:', err);
      alert('Failed to add ingredients to grocery list. Please try again later.');
    } finally {
      setProcessingIngredients(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading saved recipes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <PageBackground image="/recipe.jpg">
      <header className="bg-white/80 backdrop-blur-sm shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Your Saved Recipes</h1>
          <button 
            onClick={() => router.push('/recipes')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-gray-100 rounded-lg shadow p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">{recipe.title}</h2>
                  {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    <div className="mb-4">
                      <h3 className="text-md font-medium text-gray-700 mb-2">
                        Ingredients:
                      </h3>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {recipe.ingredients.slice(0, 5).map((ing, index) => (
                          <li key={index}>{ing.original}</li>
                        ))}
                        {recipe.ingredients.length > 5 && (
                          <li className="list-none text-gray-500 italic mt-1">
                            +{recipe.ingredients.length - 5} more ingredients
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Ingredients list will be available when adding to grocery list
                    </p>
                  )}
                  <button
                    onClick={() => handleAddToGroceryList(recipe)}
                    disabled={processingIngredients === recipe.id}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {processingIngredients === recipe.id ? (
                      'Processing...'
                    ) : (
                      'Add Ingredients to Grocery List'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {recipes.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p>You haven't saved any recipes yet.</p>
              <button
                onClick={() => router.push('/recipes')}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Find Recipes
              </button>
            </div>
          )}
        </div>
      </main>
    </PageBackground>
  );
}