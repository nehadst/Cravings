import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
// import { sendGroceryListEmail } from '@/services/emailjs-server';

// Mock email sending function for testing
async function mockSendEmail(toEmail: string, subject: string, content: string) {
  console.log(`[MOCK EMAIL] To: ${toEmail}`);
  console.log(`[MOCK EMAIL] Subject: ${subject}`);
  console.log(`[MOCK EMAIL] Content: ${content}`);
  return { success: true, message: 'Email sent (mock)' };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all pending scheduled emails for the user using raw SQL
    const pendingEmails = await prisma.$queryRaw`
      SELECT * FROM "ScheduledEmail" 
      WHERE "userId" = ${user.id} 
      AND "status" = 'PENDING' 
      AND "scheduledFor" <= ${new Date()}
    `;

    if (!pendingEmails || (Array.isArray(pendingEmails) && pendingEmails.length === 0)) {
      return NextResponse.json({
        message: 'No scheduled emails to process',
        results: []
      });
    }

    const results = [];

    // Process each scheduled email
    for (const email of pendingEmails as any[]) {
      try {
        if (email.emailType === 'GROCERY_LIST') {
          // Handle the data field - it might already be an object or a JSON string
          let data;
          if (typeof email.data === 'string') {
            try {
              data = JSON.parse(email.data);
            } catch (e) {
              console.error('Error parsing email data:', e);
              data = {};
            }
          } else if (email.data) {
            data = email.data;
          } else {
            data = {};
          }
          
          // Use mock email sending instead of EmailJS
          await mockSendEmail(
            session.user.email,
            'Your Grocery List',
            data.groceryList || 'No grocery list items'
          );

          // Update the email status to SENT using raw SQL
          await prisma.$executeRaw`
            UPDATE "ScheduledEmail" 
            SET "status" = 'SENT', "updatedAt" = ${new Date()} 
            WHERE "id" = ${email.id}
          `;

          results.push({
            id: email.id,
            status: 'SENT'
          });
        }
      } catch (error) {
        console.error(`Error processing scheduled email ${email.id}:`, error);
        
        // Update the email status to FAILED using raw SQL
        await prisma.$executeRaw`
          UPDATE "ScheduledEmail" 
          SET "status" = 'FAILED', "updatedAt" = ${new Date()} 
          WHERE "id" = ${email.id}
        `;

        results.push({
          id: email.id,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
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