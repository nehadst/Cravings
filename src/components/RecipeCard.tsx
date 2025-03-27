import Image from 'next/image';
import Link from 'next/link';
import { Recipe } from '@/services/spoonacular';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
        />
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