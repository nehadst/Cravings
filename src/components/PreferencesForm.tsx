'use client';

import { useState, useEffect } from 'react';

interface Preferences {
  // Dietary preferences
  isVegan: boolean;
  isVegetarian: boolean;
  isPescatarian: boolean;
  isKeto: boolean;
  isPaleo: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isNutFree: boolean;
  isHalal: boolean;
  isKosher: boolean;
  isLowCarb: boolean;
  isLowFat: boolean;
  
  // Allergies
  allergies: string;
  
  // Nutritional goals
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  
  // Additional information
  preferredCuisines: string;
  dislikedIngredients: string;
}

interface PreferencesFormProps {
  onSuccess: () => void;
}

export default function PreferencesForm({ onSuccess }: PreferencesFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
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
    allergies: '',
    calorieTarget: 2000,
    proteinTarget: 50,
    carbTarget: 250,
    fatTarget: 70,
    preferredCuisines: '',
    dislikedIngredients: '',
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/preferences');
        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }
        const data = await response.json();
        
        // Convert the API response to our form format
        setPreferences({
          isVegan: data.dietaryPreferences.includes('vegan'),
          isVegetarian: data.dietaryPreferences.includes('vegetarian'),
          isPescatarian: data.dietaryPreferences.includes('pescatarian'),
          isKeto: data.dietaryPreferences.includes('ketogenic'),
          isPaleo: data.dietaryPreferences.includes('paleo'),
          isGlutenFree: data.dietaryPreferences.includes('gluten free'),
          isDairyFree: data.dietaryPreferences.includes('dairy free'),
          isNutFree: data.dietaryPreferences.includes('tree nuts'),
          isHalal: data.dietaryPreferences.includes('halal'),
          isKosher: data.dietaryPreferences.includes('kosher'),
          isLowCarb: data.dietaryPreferences.includes('low-carb'),
          isLowFat: data.dietaryPreferences.includes('low-fat'),
          allergies: data.allergies.join(','),
          calorieTarget: data.nutritionalGoals.calories,
          proteinTarget: data.nutritionalGoals.protein,
          carbTarget: data.nutritionalGoals.carbs,
          fatTarget: data.nutritionalGoals.fats,
          preferredCuisines: data.cuisines.join(','),
          dislikedIngredients: data.dislikedIngredients.join(','),
        });
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError('Failed to load preferences');
      }
    };

    fetchPreferences();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save preferences');
      }

      // Only call onSuccess if the save was successful
      onSuccess();
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
          {error}
        </div>
      )}

      {/* Dietary Preferences */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Dietary Preferences
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'isVegan', label: 'Vegan' },
            { name: 'isVegetarian', label: 'Vegetarian' },
            { name: 'isPescatarian', label: 'Pescatarian' },
            { name: 'isKeto', label: 'Keto' },
            { name: 'isPaleo', label: 'Paleo' },
            { name: 'isGlutenFree', label: 'Gluten Free' },
            { name: 'isDairyFree', label: 'Dairy Free' },
            { name: 'isNutFree', label: 'Nut Free' },
            { name: 'isHalal', label: 'Halal' },
            { name: 'isKosher', label: 'Kosher' },
            { name: 'isLowCarb', label: 'Low Carb' },
            { name: 'isLowFat', label: 'Low Fat' },
          ].map(({ name, label }) => (
            <label key={name} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name={name}
                checked={preferences[name as keyof Preferences] as boolean}
                onChange={handleChange}
                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Allergies
        </h2>
        <textarea
          name="allergies"
          value={preferences.allergies}
          onChange={handleChange}
          placeholder="Enter your allergies (comma-separated)"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          rows={3}
        />
      </div>

      {/* Nutritional Goals */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Nutritional Goals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'calorieTarget', label: 'Daily Calories' },
            { name: 'proteinTarget', label: 'Protein (g)' },
            { name: 'carbTarget', label: 'Carbs (g)' },
            { name: 'fatTarget', label: 'Fat (g)' },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </label>
              <input
                type="number"
                name={name}
                value={preferences[name as keyof Preferences] as number}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Cuisines and Disliked Ingredients */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cuisines and Ingredients
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Preferred Cuisines
            </label>
            <textarea
              name="preferredCuisines"
              value={preferences.preferredCuisines}
              onChange={handleChange}
              placeholder="Enter your preferred cuisines (comma-separated)"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Disliked Ingredients
            </label>
            <textarea
              name="dislikedIngredients"
              value={preferences.dislikedIngredients}
              onChange={handleChange}
              placeholder="Enter ingredients you dislike (comma-separated)"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );
} 