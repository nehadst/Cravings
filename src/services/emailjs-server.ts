import emailjs from '@emailjs/nodejs';

interface GroceryListEmailParams {
  toEmail: string;
  groceryList: string;
  recipeName: string;
}

export async function sendGroceryListEmail({
  toEmail,
  groceryList,
  recipeName
}: GroceryListEmailParams) {
  try {
    // For server-side, we need to use the private key for authentication
    const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    console.log('EmailJS Configuration:', {
      serviceId: serviceId ? 'Set' : 'Missing',
      templateId: templateId ? 'Set' : 'Missing',
      publicKey: publicKey ? 'Set' : 'Missing',
      privateKey: privateKey ? 'Set' : 'Missing'
    });

    if (!serviceId || !templateId || !publicKey || !privateKey) {
      throw new Error('EmailJS configuration is missing');
    }

    // Initialize EmailJS with the private key for server-side usage
    emailjs.init({
      publicKey,
      privateKey
    });

    const result = await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: toEmail,
        grocery_list: groceryList,
        recipe_name: recipeName
      }
    );

    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
} 