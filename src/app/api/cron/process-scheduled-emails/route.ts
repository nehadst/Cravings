import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendGroceryListEmail } from '@/services/emailjs';
import { utcToZonedTime, format } from 'date-fns-tz';

// This endpoint should be called by a cron job service like Vercel Cron
export async function GET(request: Request) {
  try {
    // Verify the request is from a legitimate cron service
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all pending scheduled emails that are due
    const now = new Date();
    const scheduledEmails = await prisma.scheduledEmail.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: {
          lte: now
        }
      },
      include: {
        user: true
      }
    });

    const results = [];

    // Process each scheduled email
    for (const scheduledEmail of scheduledEmails) {
      try {
        if (scheduledEmail.emailType === 'GROCERY_LIST' && scheduledEmail.data?.groceryList) {
          // Send the grocery list email
          await sendGroceryListEmail({
            toEmail: scheduledEmail.user.email || '',
            groceryList: scheduledEmail.data.groceryList,
            recipeName: 'Your Scheduled Grocery List'
          });

          // Update the scheduled email status
          await prisma.scheduledEmail.update({
            where: { id: scheduledEmail.id },
            data: { status: 'SENT' }
          });

          results.push({
            id: scheduledEmail.id,
            status: 'SENT',
            emailType: scheduledEmail.emailType,
            scheduledFor: scheduledEmail.scheduledFor
          });
        }
      } catch (error) {
        console.error(`Error processing scheduled email ${scheduledEmail.id}:`, error);
        
        // Update the scheduled email status to failed
        await prisma.scheduledEmail.update({
          where: { id: scheduledEmail.id },
          data: { status: 'FAILED' }
        });

        results.push({
          id: scheduledEmail.id,
          status: 'FAILED',
          emailType: scheduledEmail.emailType,
          scheduledFor: scheduledEmail.scheduledFor,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${results.length} scheduled emails`,
      results
    });
  } catch (error) {
    console.error('Error processing scheduled emails:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled emails' },
      { status: 500 }
    );
  }
} 