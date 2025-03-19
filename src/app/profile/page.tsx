'use client';

import { useState } from 'react';
import ProfileForm from '@/components/ProfileForm';

export default function ProfilePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Dietary Profile</h1>
      <ProfileForm />
    </main>
  );
} 