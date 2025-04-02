import fetch from 'node-fetch';
import { runDietaryVerification } from './dietary-verification.js';

// Add global promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // Exit with error code
  process.exit(1);
});

async function main() {
  try {
    // Check if server is running
    try {
      const response = await fetch('http://localhost:3000/api/health');
      if (!response.ok) {
        throw new Error('Server is not responding correctly');
      }
    } catch (error) {
      console.error('\nError: Cannot connect to the Next.js server.');
      console.error('Please make sure to run "npm run dev" in a separate terminal first.');
      process.exit(1);
    }

    console.log('\nStarting dietary verification...');
    await runDietaryVerification();
  } catch (error) {
    console.error('\nVerification failed with error:');
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    process.exit(1);
  }
}

// Run with proper error handling
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 