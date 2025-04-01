'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SwipeableRecipeCard from '@/components/SwipeableRecipeCard';
import { Recipe, UserPreferences } from '@/services/spoonacular';

export default function RecipesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/preferences');
        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }
        const data = await response.json();
        setPreferences(data);
        
        // If no preferences are set, redirect to preferences page
        if (!data.dietaryPreferences.length && !data.cuisines.length) {
          router.push('/preferences');
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError('Failed to load preferences');
      }
    };

    if (session?.user) {
      fetchPreferences();
    }
  }, [session, router]);

  useEffect(() => {
    const loadInitialRecipes = async () => {
      if (!preferences) return;

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (searchQuery) {
          params.append('query', searchQuery);
        }
        if (preferences.dietaryPreferences.length) {
          params.append('diet', preferences.dietaryPreferences.join(','));
        }
        if (preferences.allergies.length) {
          params.append('intolerances', preferences.allergies.join(','));
        }
        if (preferences.cuisines.length) {
          params.append('cuisine', preferences.cuisines.join(','));
        }

        const response = await fetch(`/api/recipes?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        console.error('Error loading recipes:', err);
        setError('Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    loadInitialRecipes();
  }, [preferences, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect will handle the search when searchQuery changes
  };

  const handleSwipe = async (recipeId: number, direction: 'left' | 'right') => {
    // TODO: Implement swipe handling (like/dislike)
    console.log(`Swiped ${direction} on recipe ${recipeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading recipes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Search
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
            {error}
          </div>
        )}

        {recipes.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400">No recipes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <SwipeableRecipeCard
                key={recipe.id}
                recipe={recipe}
                onSwipeLeft={() => handleSwipe(recipe.id, 'left')}
                onSwipeRight={() => handleSwipe(recipe.id, 'right')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 