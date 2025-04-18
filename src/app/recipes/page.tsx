'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SwipeableRecipeCard from '@/components/SwipeableRecipeCard';
import { Recipe } from '@/services/spoonacular';
import PageBackground from '@/components/PageBackground';

export default function RecipesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

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
      
      if ((!data.dietaryPreferences || data.dietaryPreferences.length === 0) && !window.location.search.includes('from=preferences')) {
        router.push('/preferences');
      } else {
        await fetchRecipes();
      }
    } catch (error) {
      console.error('Error checking preferences:', error);
      setError('Failed to load preferences');
    }
  };

  const fetchRecipes = async () => {
    try {
      setIsFetchingMore(true);
      const response = await fetch('/api/recipes?applyFilters=true');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const data = await response.json();
      setRecipes(prevRecipes => [...prevRecipes, ...data]);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Failed to fetch recipes');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  const handleSwipeLeft = async () => {
    if (currentIndex >= recipes.length - 3 && !isFetchingMore) {
      fetchRecipes();
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeRight = async () => {
    try {
      const currentRecipe = recipes[currentIndex];
      
      // Terminal log: Attempting to save recipe
      console.log('\n[SAVE RECIPE] Attempting to save recipe:');
      console.log('----------------------------------------');
      console.log({
        currentIndex,
        recipeId: currentRecipe.id,
        title: currentRecipe.title
      });

      const response = await fetch('/api/recipes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: currentRecipe.id,
          title: currentRecipe.title,
          image: currentRecipe.image
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to save recipe: ${data.error || 'Unknown error'}`);
      }

      // Terminal log: Save successful
      console.log('\n[SAVE RECIPE] Recipe saved successfully:');
      console.log('----------------------------------------');
      console.log(data);

      if (currentIndex >= recipes.length - 3 && !isFetchingMore) {
        fetchRecipes();
      }
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      // Terminal log: Error saving recipe
      console.log('\n[SAVE RECIPE] ERROR:');
      console.log('----------------------------------------');
      console.error('Error saving recipe:', error);
      throw error;
    }
  };

  if (isLoading && recipes.length === 0) {
    return (
      <PageBackground image="/recipe.jpg">
        <header className="bg-white/80 backdrop-blur-sm shadow">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-black">Recipe Recommendations</h1>
            <button 
              onClick={() => router.push('/')}
              className="flex items-center text-black hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
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
      </PageBackground>
    );
  }

  if (currentIndex >= recipes.length) {
    return (
      <PageBackground image="/recipe.jpg">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-4">No more recipes!</h2>
            <p className="text-gray-400">Check back later for more recommendations.</p>
            <button
              onClick={() => {
                setCurrentIndex(0);
                fetchRecipes();
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Get More Recipes
            </button>
          </div>
        </div>
      </PageBackground>
    );
  }

  return (
    <PageBackground image="/recipe.jpg">
      <header className="bg-white/80 backdrop-blur-sm shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black">Recipe Recommendations</h1>
          <button 
            onClick={() => router.push('/')}
            className="flex items-center text-black hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
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
    </PageBackground>
  );
} 