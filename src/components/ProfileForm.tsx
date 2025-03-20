'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const profileSchema = z.object({
  // Dietary preferences
  isVegan: z.boolean().default(false),
  isVegetarian: z.boolean().default(false),
  isPescatarian: z.boolean().default(false),
  isKeto: z.boolean().default(false),
  isPaleo: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isDairyFree: z.boolean().default(false),
  isNutFree: z.boolean().default(false),
  isHalal: z.boolean().default(false),
  isKosher: z.boolean().default(false),
  isLowCarb: z.boolean().default(false),
  isLowFat: z.boolean().default(false),
  
  // Allergies
  allergies: z.string().optional(),
  
  // Nutritional goals
  calorieTarget: z.string().optional().transform(val => val ? parseInt(val) : null),
  proteinTarget: z.string().optional().transform(val => val ? parseInt(val) : null),
  carbTarget: z.string().optional().transform(val => val ? parseInt(val) : null),
  fatTarget: z.string().optional().transform(val => val ? parseInt(val) : null),
  
  // Additional info
  preferredCuisines: z.string().optional(),
  dislikedIngredients: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      isVegan: false,
      isVegetarian: false,
      isPescatarian: false,
      isKeto: false,
      isPaleo: false,
      isGlutenFree: false,
      isDairyFree: false,
      isNutFree: false,
      isHalal: false,
      isKosher: false,
      isLowCarb: false,
      isLowFat: false,
    }
  });
  
  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      // No longer need to transform strings to arrays
      // SQLite stores them as comma-separated strings
      const transformedData = {
        ...data,
        // Just trim the strings to clean up any extra spaces
        allergies: data.allergies ? data.allergies.trim() : "",
        preferredCuisines: data.preferredCuisines ? data.preferredCuisines.trim() : "",
        dislikedIngredients: data.dislikedIngredients ? data.dislikedIngredients.trim() : "",
      };
      
      // Send data to API
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }
      
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* Dietary Preferences Section */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Dietary Preferences</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Select all that apply to your diet</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { id: 'isVegan', label: 'Vegan' },
            { id: 'isVegetarian', label: 'Vegetarian' },
            { id: 'isPescatarian', label: 'Pescatarian' },
            { id: 'isKeto', label: 'Keto' },
            { id: 'isPaleo', label: 'Paleo' },
            { id: 'isGlutenFree', label: 'Gluten-Free' },
            { id: 'isDairyFree', label: 'Dairy-Free' },
            { id: 'isNutFree', label: 'Nut-Free' },
            { id: 'isHalal', label: 'Halal' },
            { id: 'isKosher', label: 'Kosher' },
            { id: 'isLowCarb', label: 'Low-Carb' },
            { id: 'isLowFat', label: 'Low-Fat' },
          ].map(item => (
            <div 
              key={item.id} 
              className="flex items-center space-x-3 p-3 rounded-lg bg-gray-100 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <input
                type="checkbox"
                id={item.id}
                {...register(item.id as keyof ProfileFormData)}
                className="h-4 w-4 text-gray-800 focus:ring-gray-500 border-gray-300 rounded"
              />
              <label htmlFor={item.id} className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Allergies Section */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Allergies & Food Sensitivities</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">List any foods you're allergic to or need to avoid</p>
        </div>
        
        <div className="space-y-2">
          <input
            type="text"
            id="allergies"
            {...register('allergies')}
            placeholder="e.g., peanuts, shellfish, eggs (separate with commas)"
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Separate multiple items with commas</p>
        </div>
      </div>
      
      {/* Nutritional Goals Section */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Nutritional Goals</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Set your daily nutritional targets</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="calorieTarget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Daily Calorie Target
            </label>
            <input
              type="number"
              id="calorieTarget"
              {...register('calorieTarget')}
              placeholder="e.g., 2000"
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="proteinTarget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Daily Protein Target (g)
            </label>
            <input
              type="number"
              id="proteinTarget"
              {...register('proteinTarget')}
              placeholder="e.g., 120"
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="carbTarget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Daily Carb Target (g)
            </label>
            <input
              type="number"
              id="carbTarget"
              {...register('carbTarget')}
              placeholder="e.g., 200"
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="fatTarget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Daily Fat Target (g)
            </label>
            <input
              type="number"
              id="fatTarget"
              {...register('fatTarget')}
              placeholder="e.g., 65"
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </div>
      
      {/* Additional Preferences */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Additional Preferences</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tell us more about your food preferences</p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="preferredCuisines" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Preferred Cuisines
            </label>
            <input
              type="text"
              id="preferredCuisines"
              {...register('preferredCuisines')}
              placeholder="e.g., Italian, Mexican, Thai (separate with commas)"
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="dislikedIngredients" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Disliked Ingredients
            </label>
            <input
              type="text"
              id="dislikedIngredients"
              {...register('dislikedIngredients')}
              placeholder="e.g., cilantro, olives, mushrooms (separate with commas)"
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-800 hover:bg-blue-900 text-white font-medium rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </button>
          
          {submitSuccess && (
            <p className="text-green-600 dark:text-green-400 font-medium">
              Your preferences have been saved!
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
