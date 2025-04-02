import emailjs from '@emailjs/browser';

// Initialize EmailJS with public key
emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '');

interface GroceryListEmailParams {
  toEmail: string;
  groceryList: string;
  recipeName: string;
}

export const sendGroceryListEmail = async (params: GroceryListEmailParams) => {
  try {
    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
      {
        to_email: params.toEmail,
        grocery_list: params.groceryList,
        recipe_name: params.recipeName,
      }
    );
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}; 