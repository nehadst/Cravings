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
      // Transform string inputs to arrays
      const transformedData = {
        ...data,
        allergies: data.allergies ? data.allergies.split(',').map(item => item.trim()) : [],
        preferredCuisines: data.preferredCuisines ? data.preferredCuisines.split(',').map(item => item.trim()) : [],
        dislikedIngredients: data.dislikedIngredients ? data.dislikedIngredients.split(',').map(item => item.trim()) : [],
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      {/* Dietary Preferences Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Dietary Preferences</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
            <div key={item.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={item.id}
                {...register(item.id as keyof ProfileFormData)}
                className="h-4 w-4"
              />
              <label htmlFor={item.id} className="text-sm font-medium">
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Allergies Section */}
      <div className="space-y-2">
        <label htmlFor="allergies" className="block text-sm font-medium">
          Allergies (comma separated)
        </label>
        <input
          type="text"
          id="allergies"
          {...register('allergies')}
          placeholder="e.g., peanuts, shellfish, eggs"
          className="w-full p-2 border rounded-md"
        />
      </div>
      
      {/* Nutritional Goals Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Nutritional Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="calorieTarget" className="block text-sm font-medium">
              Daily Calorie Target
            </label>
            <input
              type="number"
              id="calorieTarget"
              {...register('calorieTarget')}
              placeholder="e.g., 2000"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="proteinTarget" className="block text-sm font-medium">
              Daily Protein Target (g)
            </label>
            <input
              type="number"
              id="proteinTarget"
              {...register('proteinTarget')}
              placeholder="e.g., 120"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="carbTarget" className="block text-sm font-medium">
              Daily Carb Target (g)
            </label>
            <input
              type="number"
              id="carbTarget"
              {...register('carbTarget')}
              placeholder="e.g., 200"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="fatTarget" className="block text-sm font-medium">
              Daily Fat Target (g)
            </label>
            <input
              type="number"
              id="fatTarget"
              {...register('fatTarget')}
              placeholder="e.g., 65"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
      </div>
      
      {/* Additional Preferences */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Additional Preferences</h2>
        <div className="space-y-2">
          <label htmlFor="preferredCuisines" className="block text-sm font-medium">
            Preferred Cuisines (comma separated)
          </label>
          <input
            type="text"
            id="preferredCuisines"
            {...register('preferredCuisines')}
            placeholder="e.g., Italian, Mexican, Thai"
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="dislikedIngredients" className="block text-sm font-medium">
            Disliked Ingredients (comma separated)
          </label>
          <input
            type="text"
            id="dislikedIngredients"
            {...register('dislikedIngredients')}
            placeholder="e.g., cilantro, olives, mushrooms"
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>
      
      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Saving...' : 'Save Preferences'}
        </button>
        
        {submitSuccess && (
          <p className="mt-2 text-green-600">Your preferences have been saved!</p>
        )}
      </div>
    </form>
  );
}
