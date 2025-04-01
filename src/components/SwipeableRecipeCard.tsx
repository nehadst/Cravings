'use client';

import { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Recipe } from '@/services/spoonacular';

interface SwipeableRecipeCardProps {
  recipe?: Recipe;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function SwipeableRecipeCard({
  recipe,
  onSwipeLeft,
  onSwipeRight,
}: SwipeableRecipeCardProps) {
  const [imageError, setImageError] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!recipe) {
    return (
      <div className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-4">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleDragStart = (event: any, info: PanInfo) => {
    setDragStart({ x: info.point.x, y: info.point.y });
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const dragDistance = info.point.x - dragStart.x;

    if (Math.abs(dragDistance) > 100) {
      if (dragDistance > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }
  };

  const dietaryTags = [
    recipe.glutenFree && 'Gluten Free',
    recipe.dairyFree && 'Dairy Free',
    recipe.vegetarian && 'Vegetarian',
    recipe.vegan && 'Vegan',
    recipe.ketogenic && 'Keto',
    recipe.paleo && 'Paleo',
    recipe.lowFodmap && 'Low FODMAP',
  ].filter(Boolean);

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-700">
        {!imageError ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No image available</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {recipe.title}
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg
              className={`w-6 h-6 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {dietaryTags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-100 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
          <span>Ready in {recipe.readyInMinutes} mins</span>
          <span>•</span>
          <span>{recipe.servings} servings</span>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 dark:text-white">Ingredients:</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
            {recipe.extendedIngredients.slice(0, 5).map((ingredient, index) => (
              <li key={index}>
                {ingredient.amount} {ingredient.unit} {ingredient.name}
              </li>
            ))}
            {recipe.extendedIngredients.length > 5 && (
              <li>...and {recipe.extendedIngredients.length - 5} more</li>
            )}
          </ul>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4"
          >
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Instructions:</h3>
              <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-300 space-y-2">
                {recipe.analyzedInstructions[0]?.steps.map((step, index) => (
                  <li key={index}>{step.step}</li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Nutritional Information:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div>Calories: {recipe.nutrition?.calories}</div>
                <div>Protein: {recipe.nutrition?.protein}</div>
                <div>Carbs: {recipe.nutrition?.carbs}</div>
                <div>Fat: {recipe.nutrition?.fat}</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Cuisines:</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.cuisines.map((cuisine, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-4">
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Visit Original Recipe
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
} 