'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Recipe } from '@/services/spoonacular';
import RecipeCard from '@/components/RecipeCard';

export default function RecipesPage() {
  const { data: session } = useSession();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch('/api/preferences');
        if (!response.ok) throw new Error('Failed to fetch preferences');
        const data = await response.json();
        setPreferences(data);
      } catch (err) {
        console.error('Error fetching preferences:', err);
      }
    };

    fetchPreferences();
  }, [session]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        ...(preferences && { preferences: JSON.stringify(preferences) }),
      });
      
      const response = await fetch(`/api/recipes?${params}`);
      if (!response.ok) throw new Error('Failed to search recipes');
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search recipes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Recipe Search
          </h1>
          {preferences && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Search will be filtered based on your preferences
            </p>
          )}
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for recipes..."
                className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="text-center text-red-600 dark:text-red-400 mb-8">
            {error}
          </div>
        )}

        {!loading && !error && recipes.length === 0 && searchQuery && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No recipes found. Try a different search term.
          </div>
        )}

        {!loading && !error && recipes.length === 0 && !searchQuery && (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Enter a search term to find recipes.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </div>
  );
} 