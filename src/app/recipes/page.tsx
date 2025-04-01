'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SwipeableRecipeCard from '@/components/SwipeableRecipeCard';
import { Recipe } from '@/services/spoonacular';

export default function RecipesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      checkPreferences();
    }
  }, [status, router]);

  const checkPreferences = async () => {
    try {
      const response = await fetch('/api/preferences');
      if (!response.ok) {
        throw new Error('Failed to fetch preferences');
      }
      const data = await response.json();
      
      // Only redirect to preferences if we have no preferences and we're not coming from the preferences page
      if ((!data.dietaryPreferences || data.dietaryPreferences.length === 0) && !window.location.search.includes('from=preferences')) {
        router.push('/preferences');
      } else {
        // If we have preferences or we're coming from preferences page, fetch recipes
        fetchRecipes();
      }
    } catch (error) {
      console.error('Error checking preferences:', error);
      setError('Failed to load preferences');
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipeLeft = async () => {
    // Move to next recipe
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeRight = async () => {
    // Save recipe
    try {
      await fetch('/api/recipes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipes[currentIndex]),
      });
    } catch (error) {
      console.error('Error saving recipe:', error);
    }

    // Move to next recipe
    setCurrentIndex(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black dark:bg-black">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recipe Recommendations</h1>
            <button 
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </button>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <SwipeableRecipeCard
              recipe={undefined}
              onSwipeLeft={() => {}}
              onSwipeRight={() => {}}
            />
          </div>
        </main>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="min-h-screen bg-black dark:bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">No more recipes!</h2>
          <p className="text-gray-400">Check back later for more recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black dark:bg-black">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recipe Recommendations</h1>
          <button 
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <SwipeableRecipeCard
            recipe={recipes[currentIndex]}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
          />
        </div>
      </main>
    </div>
  );
} 