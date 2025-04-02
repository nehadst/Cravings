'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { sendGroceryListEmail } from '@/services/emailjs';

export default function GroceryListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [items, setItems] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

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
    <div className="min-h-screen bg-black">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Grocery List</h1>
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
        <div className="space-y-4">
          <textarea
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder="Enter your grocery list items (one per line)"
            className="w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            rows={10}
          />
          
          <div className="flex space-x-4">
            <button
              onClick={handleUpdateList}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
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
      </main>
    </div>
  );
} 