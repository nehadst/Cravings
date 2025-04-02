'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';

const accountSchema = z.object({
  currentPassword: z.string().min(1, 'Password must be at least 1 characters'),
  newPassword: z.string().min(4, 'Password must be at least 4 characters'),
  confirmPassword: z.string().min(4, 'Password must be at least 4 characters'),
}).refine((data) => {
  return data.newPassword === data.confirmPassword;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AccountFormData = z.infer<typeof accountSchema>;

export default function AccountForm() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
  });
  
  const onSubmit = async (data: AccountFormData) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setError(null);
    
    try {
      const response = await fetch('/api/account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update account');
      }
      
      setSubmitSuccess(true);
      reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Redirect to home page or handle sign out
      window.location.href = '/';
    } catch (error) {
      setError('Failed to delete account. Please try again.');
    }
  };
  
  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Account Information</h2>
            <p className="text-sm text-gray-500">Your account details</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
              {session?.user?.email}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
            <p className="text-sm text-gray-500">Update your password</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                {...register('currentPassword')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-gray-900"
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                {...register('newPassword')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-gray-900"
              />
              {errors.newPassword && (
                <p className="text-sm text-red-600">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...register('confirmPassword')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white text-gray-900"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {submitSuccess && (
          <div className="p-4 bg-green-50 text-green-600 rounded-lg">
            Password updated successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Delete Account Permanently
        </button>
      </div>
    </div>
  );
} 