'use client';

import Link from 'next/link';
import LoginForm from '@/components/LoginForm';
import PageBackground from '@/components/PageBackground';

export default function LoginPage() {
  return (
    <PageBackground image="/recipe.jpg">
      <header className="bg-white/80 backdrop-blur-sm shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
          <Link 
            href="/" 
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-gray-100 rounded-lg shadow p-6 md:p-8 max-w-md mx-auto">
          <p className="text-gray-600 mb-6">
            Sign in to your account to manage your dietary preferences.
          </p>
          <LoginForm />
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-gray-900 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </PageBackground>
  );
} 