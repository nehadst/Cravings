'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { sendGroceryListEmail } from '@/services/emailjs';
import PageBackground from '@/components/PageBackground';

export default function GroceryListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [items, setItems] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [ingredientsToProcess, setIngredientsToProcess] = useState('');
  const [isProcessingIngredients, setIsProcessingIngredients] = useState(false);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchGroceryList();
    }
  }, [status, router]);

  const fetchGroceryList = async () => {
    try {
      const response = await fetch('/api/grocery-list');
      if (!response.ok) {
        throw new Error('Failed to fetch grocery list');
      }
      const data = await response.json();
      setItems(data.items || '');
    } catch (err) {
      setError('Failed to load grocery list');
      console.error('Error fetching grocery list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateList = async () => {
    try {
      const response = await fetch('/api/grocery-list/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error('Failed to update grocery list');
      }

      alert('Grocery list updated successfully!');
    } catch (err) {
      console.error('Error updating grocery list:', err);
      alert('Failed to update grocery list. Please try again.');
    }
  };

  const handleSendList = async () => {
    try {
      setIsSending(true);
      
      // Send email using EmailJS
      await sendGroceryListEmail({
        toEmail: session?.user?.email || '',
        groceryList: items,
        recipeName: 'Your Grocery List'
      });

      // Clear the grocery list in the database
      const response = await fetch('/api/grocery-list/clear', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to clear grocery list');
      }

      alert('Grocery list sent to your email successfully!');
      setItems(''); // Clear the list after sending
    } catch (err) {
      console.error('Error sending grocery list:', err);
      alert('Failed to send grocery list. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleProcessIngredients = async () => {
    try {
      setIsProcessingIngredients(true);
      
      // Process ingredients with OpenAI
      const response = await fetch('/api/grocery-list/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: ingredientsToProcess }),
      });

      if (!response.ok) {
        throw new Error('Failed to process ingredients');
      }

      const data = await response.json();
      
      // Update the grocery list with the processed ingredients
      setItems(data.groceryList);
      
      // Update the database with the new list
      await fetch('/api/grocery-list/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: data.groceryList }),
      });

      alert('Ingredients processed and added to grocery list!');
      setIngredientsToProcess(''); // Clear the input after processing
    } catch (err) {
      console.error('Error processing ingredients:', err);
      alert('Failed to process ingredients. Please try again.');
    } finally {
      setIsProcessingIngredients(false);
    }
  };

  const handleAddItem = () => {
    if (newItem.trim()) {
      const updatedItems = items ? `${items}\n${newItem.trim()}` : newItem.trim();
      setItems(updatedItems);
      setNewItem('');
      setIsAddingItem(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading grocery list...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <PageBackground image="/recipe.jpg">
      <header className="bg-white/80 backdrop-blur-sm shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Your Grocery List</h1>
          <button 
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 md:p-8">
          {/* Grocery List Textarea */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Grocery List</h2>
            <textarea
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="Your grocery list will appear here..."
              className="w-full p-4 rounded-md border border-gray-300 bg-white text-gray-900 min-h-[200px]"
              rows={10}
            />
            <div className="flex justify-between mt-4">
              <button
                onClick={handleUpdateList}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save List
              </button>
              <button
                onClick={handleSendList}
                disabled={isSending || !items.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isSending ? 'Sending...' : 'Send to Email'}
              </button>
            </div>
          </div>

          {/* Add Item Section */}
          <div className="mb-6 space-y-4">
            <button
              onClick={() => setIsAddingItem(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add New Item
            </button>

            {isAddingItem && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Enter item name"
                    className="flex-1 p-2 rounded-md border border-gray-300 bg-white text-gray-900"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                  />
                  <button
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Process Multiple Ingredients</h2>
              <textarea
                value={ingredientsToProcess}
                onChange={(e) => setIngredientsToProcess(e.target.value)}
                placeholder="Enter ingredients (one per line)"
                className="w-full p-2 rounded-md border-gray-300 bg-white text-gray-900"
                rows={4}
              />
              <button
                onClick={handleProcessIngredients}
                disabled={isProcessingIngredients || !ingredientsToProcess.trim()}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isProcessingIngredients ? 'Processing...' : 'Process with AI'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </PageBackground>
  );
} 