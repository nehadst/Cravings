// Import the browser version for client-side use
import emailjsBrowser from '@emailjs/browser';

// Import the server version for server-side use
import emailjsServer from '@emailjs/nodejs';

// Initialize EmailJS with public key
if (typeof window !== 'undefined') {
  // Client-side initialization
  emailjsBrowser.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '');
}

interface GroceryListEmailParams {
  toEmail: string;
  groceryList: string;
  recipeName: string;
}

export const sendGroceryListEmail = async (params: GroceryListEmailParams) => {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Client-side email sending
      const response = await emailjsBrowser.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
        {
          to_email: params.toEmail,
          grocery_list: params.groceryList,
          recipe_name: params.recipeName,
        }
      );
      return response;
    } else {
      // Server-side email sending
      const response = await emailjsServer.send(
        process.env.EMAILJS_SERVICE_ID || '',
        process.env.EMAILJS_TEMPLATE_ID || '',
        {
          to_email: params.toEmail,
          grocery_list: params.groceryList,
          recipe_name: params.recipeName,
        },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY || '',
          privateKey: process.env.EMAILJS_PRIVATE_KEY || '',
        }
      );
      return response;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Re-export the client-side and server-side EmailJS services
export * from './emailjs-client';
export * from './emailjs-server'; 