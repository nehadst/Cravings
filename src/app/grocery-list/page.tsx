'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { sendGroceryListEmail } from '@/services/emailjs-client';
import PageBackground from '@/components/PageBackground';
import { format } from 'date-fns';

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
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledEmails, setScheduledEmails] = useState<any[]>([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);
  const [isProcessingScheduled, setIsProcessingScheduled] = useState(false);
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchGroceryList();
      fetchScheduledEmails();
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

  const fetchScheduledEmails = async () => {
    try {
      setIsLoadingScheduled(true);
      const response = await fetch('/api/grocery-list/scheduled');
      if (!response.ok) {
        throw new Error('Failed to fetch scheduled emails');
      }
      const data = await response.json();
      setScheduledEmails(data.scheduledEmails || []);
    } catch (err) {
      console.error('Error fetching scheduled emails:', err);
    } finally {
      setIsLoadingScheduled(false);
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

  const handleScheduleEmail = async () => {
    try {
      setIsSubmittingSchedule(true);
      
      if (!scheduledDate || !scheduledTime) {
        alert('Please select both date and time for scheduling');
        return;
      }

      const response = await fetch('/api/grocery-list/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          scheduledDate, 
          scheduledTime 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule email');
      }

      const data = await response.json();
      alert(`Grocery list email scheduled for ${data.scheduledFor} EST`);
      
      // Refresh scheduled emails list
      fetchScheduledEmails();
      
      // Reset form
      setScheduledDate('');
      setScheduledTime('');
      setIsScheduling(false);
    } catch (err) {
      console.error('Error scheduling email:', err);
      alert('Failed to schedule email. Please try again.');
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleProcessScheduledEmails = async () => {
    try {
      setIsProcessingScheduled(true);
      
      const response = await fetch('/api/grocery-list/process-scheduled', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to process scheduled emails');
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        alert(`Processed ${data.results.length} scheduled emails. Check your email!`);
      } else {
        alert('No scheduled emails were due to be sent.');
      }
      
      // Refresh the page to update the scheduled emails list
      fetchScheduledEmails();
    } catch (err) {
      console.error('Error processing scheduled emails:', err);
      alert('Failed to process scheduled emails. Please try again.');
    } finally {
      setIsProcessingScheduled(false);
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

  const handleCancelScheduledEmail = async (emailId: string) => {
    try {
      const response = await fetch(`/api/grocery-list/schedule/${emailId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel scheduled email');
      }

      alert('Scheduled email cancelled successfully');
      fetchScheduledEmails(); // Refresh the list
    } catch (err) {
      console.error('Error cancelling scheduled email:', err);
      alert('Failed to cancel scheduled email. Please try again.');
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

  // Get tomorrow's date for the min date attribute
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

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
              <div className="flex gap-2">
                <button
                  onClick={() => setIsScheduling(true)}
                  disabled={!items.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  Schedule Email
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
          </div>

          {/* Schedule Email Modal */}
          {isScheduling && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Schedule Email</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date (EST)</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={tomorrowFormatted}
                      className="w-full p-2 rounded-md border border-gray-300 bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time (EST)</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full p-2 rounded-md border border-gray-300 bg-white text-gray-900"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={() => setIsScheduling(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleScheduleEmail}
                      disabled={isSubmittingSchedule || !scheduledDate || !scheduledTime}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      {isSubmittingSchedule ? 'Scheduling...' : 'Schedule'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Emails Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Scheduled Emails</h2>
              <button
                onClick={handleProcessScheduledEmails}
                disabled={isProcessingScheduled}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isProcessingScheduled ? 'Processing...' : 'Check & Send Due Emails'}
              </button>
            </div>
            {isLoadingScheduled ? (
              <div className="text-gray-600">Loading scheduled emails...</div>
            ) : scheduledEmails.length > 0 ? (
              <div className="space-y-2">
                {scheduledEmails.map((email) => (
                  <div key={email.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div>
                      <div className="font-medium text-gray-900">
                        Scheduled for: {new Date(email.scheduledFor).toLocaleString('en-US', { timeZone: 'America/New_York' })}
                      </div>
                      <div className="text-sm text-gray-600">Status: {email.status}</div>
                    </div>
                    <button
                      onClick={() => handleCancelScheduledEmail(email.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-600">No scheduled emails</div>
            )}
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