'use client';

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Only show authenticated content when status is "authenticated"
  const isAuthenticated = status === "authenticated" && session;

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black dark:bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full flex justify-end">
        {isAuthenticated && (
          <Link
            href="/preferences"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-4"
          >
            Recipes
          </Link>
        )}
        {isAuthenticated ? (
          <>
            <Link 
              href="/profile" 
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4"
            >
              My Profile
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors ml-4"
            >
              Sign Out
            </button>
          </>
        ) : (
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-gray-800 text-white gap-2 hover:bg-gray-900 font-medium text-sm h-10 px-4"
            >
              Sign Up
            </Link>
          </div>
        )}
      </header>
      
      <main className="flex flex-col gap-[32px] items-center text-center max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to Cravings</h1>
        <p className="text-xl mb-8">
          Your personalized dietary planning assistant. Get recipe recommendations,
          track your inventory, manage grocery lists, and analyze nutritional data
          based on your preferences and dietary needs.
        </p>
        
        <div className="flex gap-6 items-center flex-col sm:flex-row">
          {isAuthenticated ? (
            <Link
              href="/preferences"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-gray-800 text-white gap-2 hover:bg-gray-900 font-medium text-base h-12 px-6 sm:w-auto"
            >
              Get Started with Recipes
            </Link>
          ) : (
            <Link
              href="/register"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-gray-800 text-white gap-2 hover:bg-gray-900 font-medium text-base h-12 px-6 sm:w-auto"
            >
              Get Started
            </Link>
          )}
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-base h-12 px-6 w-full sm:w-auto"
            href="#features"
          >
            Explore Features
          </a>
        </div>
        
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Recipe Recommendations</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Get personalized recipe suggestions based on your dietary preferences and restrictions.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Inventory Management</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Track your kitchen inventory and get alerts when items are running low.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Grocery Lists</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Create and manage your grocery lists based on your meal plans.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Nutritional Analysis</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Track your nutritional intake and get insights into your eating habits.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="w-full text-center text-gray-600 dark:text-gray-400">
        <p>© 2024 Cravings. All rights reserved.</p>
      </footer>
    </div>
  );
}
