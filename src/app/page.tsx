'use client';

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="w-full flex justify-end">
        {session ? (
          <>
            <Link 
              href="/profile" 
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4"
            >
              My Profile
            </Link>
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
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
          {session ? (
            <Link
              href="/profile"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-gray-800 text-white gap-2 hover:bg-gray-900 font-medium text-base h-12 px-6 sm:w-auto"
            >
              Set Up Your Profile
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
        
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="border border-black/10 dark:border-white/10 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Recipe Recommendations</h2>
            <p>Find recipes that match your dietary preferences and nutritional goals.</p>
          </div>
          <div className="border border-black/10 dark:border-white/10 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Inventory Tracking</h2>
            <p>Keep track of what's in your pantry and get alerts when items run low.</p>
          </div>
          <div className="border border-black/10 dark:border-white/10 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Grocery List Management</h2>
            <p>Automatically generate shopping lists based on recipes you like.</p>
          </div>
          <div className="border border-black/10 dark:border-white/10 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Nutritional Analysis</h2>
            <p>Get detailed nutritional information for each recipe.</p>
          </div>
        </div>
      </main>
      
      <footer className="flex gap-[24px] flex-wrap items-center justify-center">
        <p className="text-sm text-gray-500">© 2023 Cravings App. All rights reserved.</p>
      </footer>
    </div>
  );
}
