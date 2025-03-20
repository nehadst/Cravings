'use client';

import Link from 'next/link';
import { useState } from 'react';
import ProfileForm from '@/components/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black dark:bg-black">
      <header className="bg-black shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Dietary Profile</h1>
          <Link 
            href="/" 
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-black rounded-lg shadow p-6 md:p-8">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Tell us about your dietary preferences and needs so we can provide personalized recipe recommendations.
          </p>
          <ProfileForm />
        </div>
      </main>
    </div>
  );
} 