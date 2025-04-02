import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // For testing purposes, we'll create a simple token
    const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.name
      }
    });
  } catch (error) {
    console.error('[TEST_AUTH_ERROR]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
} 