import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import Image from 'next/image';
import Link from 'next/link';
import { Recipe } from '@/services/spoonacular';

interface SwipeableRecipeCardProps {
  recipe: Recipe;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function SwipeableRecipeCard({
  recipe,
  onSwipeLeft,
  onSwipeRight,
}: SwipeableRecipeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const handlers = useSwipeable({
    onSwiping: (e) => {
      setIsDragging(true);
      setDragOffset(e.deltaX);
    },
    onTouchEndOrOnMouseUp: () => {
      setIsDragging(false);
      setDragOffset(0);
    },
    onSwipedLeft: () => {
      onSwipeLeft();
    },
    onSwipedRight: () => {
      onSwipeRight();
    },
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
  });

  const cardStyle = {
    transform: isDragging ? `translateX(${dragOffset}px)` : 'none',
    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
  };

  return (
    <div
      {...handlers}
      className="relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
      style={cardStyle}
    >
      <div className="relative h-96">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">{recipe.title}</h2>
          <div className="flex items-center space-x-4 text-sm">
            <span>{recipe.readyInMinutes} mins</span>
            <span>•</span>
            <span>{recipe.servings} servings</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
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

        <div className="flex justify-between items-center">
          <Link
            href={`/recipes/${recipe.id}`}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
          >
            View Recipe →
          </Link>
          <div className="flex space-x-4">
            <button
              onClick={onSwipeLeft}
              className="p-2 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800"
            >
              ✕
            </button>
            <button
              onClick={onSwipeRight}
              className="p-2 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800"
            >
              ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 