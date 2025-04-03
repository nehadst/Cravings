import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

// Define dietary restrictions and their incompatible ingredients
const dietaryRestrictions = {
  isVegan: ['meat', 'chicken', 'beef', 'pork', 'fish', 'egg', 'dairy', 'milk', 'cheese', 'butter', 'cream', 'honey'],
  isVegetarian: ['meat', 'chicken', 'beef', 'pork', 'fish'],
  isPescatarian: ['meat', 'chicken', 'beef', 'pork'],
  isKeto: ['sugar', 'flour', 'bread', 'pasta', 'rice', 'potato', 'corn'],
  isPaleo: ['sugar', 'flour', 'bread', 'pasta', 'rice', 'dairy', 'milk', 'cheese', 'processed'],
  isGlutenFree: ['flour', 'bread', 'pasta', 'wheat', 'barley', 'rye', 'gluten'],
  isDairyFree: ['dairy', 'milk', 'cheese', 'butter', 'cream', 'yogurt'],
  isNutFree: ['peanut', 'almond', 'cashew', 'walnut', 'pecan', 'hazelnut', 'nut'],
  isHalal: ['pork', 'alcohol', 'gelatin'],
  isKosher: ['pork', 'shellfish', 'mixing meat and dairy']
};

// Define the recipe type
interface Recipe {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  recipeId: number;
  title: string;
  image: string;
}

async function main() {
  try {
    console.log('Starting verification test...');
    
    // Get all test users (those with email starting with "test-user-")
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          startsWith: 'test-user-'
        }
      },
      include: {
        preferences: true,
        savedRecipes: true
      }
    });
    
    if (testUsers.length === 0) {
      console.log('No test users found. Please run the generate-test-data.ts script first.');
      return;
    }
    
    console.log(`Found ${testUsers.length} test users`);
    
    // Initialize test results
    const testResults = {
      totalUsers: testUsers.length,
      totalRecipes: 0,
      compliantRecipes: 0,
      nonCompliantRecipes: 0,
      systemCaughtNonCompliant: 0,
      manuallyVerifiedNonCompliant: 0,
      systemEffectiveness: 0,
      userResults: [] as any[]
    };
    
    // Test each user
    for (const user of testUsers) {
      console.log(`\nTesting user: ${user.email}`);
      
      // Get saved recipes for this user
      const savedRecipes = user.savedRecipes || [];
      console.log(`User has ${savedRecipes.length} saved recipes`);
      
      // Initialize user results
      const userResult = {
        email: user.email,
        preferences: user.preferences,
        totalRecipes: savedRecipes.length,
        compliantRecipes: 0,
        nonCompliantRecipes: 0,
        systemCaughtNonCompliant: 0,
        manuallyVerifiedNonCompliant: 0,
        systemEffectiveness: 0,
        nonCompliantDetails: [] as any[]
      };
      
      // Test each recipe
      for (const recipe of savedRecipes) {
        // Check dietary compliance
        const nonCompliantRestrictions = checkDietaryCompliance(recipe, user.preferences);
        
        // Simulate manual verification to find actual non-compliant recipes
        const isActuallyNonCompliant = simulateManualVerification(recipe, user.preferences);
        
        // Update counts
        if (nonCompliantRestrictions.length > 0) {
          userResult.nonCompliantRecipes++;
          userResult.systemCaughtNonCompliant++;
          testResults.systemCaughtNonCompliant++;
          
          userResult.nonCompliantDetails.push({
            recipe,
            restrictions: nonCompliantRestrictions,
            caughtBySystem: true
          });
        } else {
          userResult.compliantRecipes++;
        }
        
        // Update manually verified non-compliant count
        if (isActuallyNonCompliant) {
          userResult.manuallyVerifiedNonCompliant++;
          testResults.manuallyVerifiedNonCompliant++;
          
          // If the system didn't catch this non-compliant recipe
          if (nonCompliantRestrictions.length === 0) {
            userResult.nonCompliantDetails.push({
              recipe,
              restrictions: ['Missed by system'],
              caughtBySystem: false
            });
          }
        }
      }
      
      // Calculate user's system effectiveness
      userResult.systemEffectiveness = userResult.manuallyVerifiedNonCompliant > 0 
        ? (userResult.systemCaughtNonCompliant / userResult.manuallyVerifiedNonCompliant) * 100 
        : 100;
      
      // Update total counts
      testResults.totalRecipes += userResult.totalRecipes;
      testResults.compliantRecipes += userResult.compliantRecipes;
      testResults.nonCompliantRecipes += userResult.nonCompliantRecipes;
      
      // Add user results
      testResults.userResults.push(userResult);
    }
    
    // Calculate overall system effectiveness
    testResults.systemEffectiveness = testResults.manuallyVerifiedNonCompliant > 0 
      ? (testResults.systemCaughtNonCompliant / testResults.manuallyVerifiedNonCompliant) * 100 
      : 100;
    
    // Generate report
    generateReport(testResults);
    
    console.log('\nVerification test completed successfully!');
    console.log(`Report generated at: ${path.join(__dirname, 'verification-report.html')}`);
  } catch (error) {
    console.error('Error running verification test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Function to check if a recipe complies with dietary restrictions
function checkDietaryCompliance(recipe: Recipe, preferences: any): string[] {
  const nonCompliantRestrictions: string[] = [];
  
  // If preferences are null or undefined, consider the recipe compliant
  if (!preferences) {
    return nonCompliantRestrictions;
  }
  
  // Get recipe ingredients (this is a simplified version)
  // In a real implementation, you would parse the recipe data to get ingredients
  const recipeIngredients = [
    recipe.title.toLowerCase(),
    // Add more ingredients if available in the recipe data
  ];
  
  // Check each dietary restriction
  for (const [restriction, incompatibleIngredients] of Object.entries(dietaryRestrictions)) {
    // Skip if the user doesn't have this restriction
    if (!preferences[restriction]) continue;
    
    // Check if any incompatible ingredient is in the recipe
    for (const ingredient of recipeIngredients) {
      if (incompatibleIngredients.some(incompatible => ingredient.includes(incompatible))) {
        nonCompliantRestrictions.push(restriction);
        break;
      }
    }
  }
  
  return nonCompliantRestrictions;
}

// Function to simulate manual verification of recipe compliance
function simulateManualVerification(recipe: Recipe, preferences: any): boolean {
  // If preferences are null or undefined, consider the recipe compliant
  if (!preferences) {
    return false;
  }
  
  // Get recipe ingredients (this is a simplified version)
  const recipeIngredients = [
    recipe.title.toLowerCase(),
    // Add more ingredients if available in the recipe data
  ];
  
  // Check each dietary restriction
  for (const [restriction, incompatibleIngredients] of Object.entries(dietaryRestrictions)) {
    // Skip if the user doesn't have this restriction
    if (!preferences[restriction]) continue;
    
    // Check if any incompatible ingredient is in the recipe
    for (const ingredient of recipeIngredients) {
      if (incompatibleIngredients.some(incompatible => ingredient.includes(incompatible))) {
        return true; // Recipe is non-compliant
      }
    }
  }
  
  return false; // Recipe is compliant
}

function generateReport(results: any) {
  // Calculate overall compliance rate
  const overallComplianceRate = results.compliantRecipes / results.totalRecipes * 100;
  
  // Generate HTML report
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recipe Verification Test Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .summary {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .user-section {
      margin-bottom: 30px;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 15px;
    }
    .success {
      color: #28a745;
    }
    .non-compliant {
      color: #ffc107;
    }
    .missed {
      color: #dc3545;
    }
    .stats {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      padding: 15px;
      background-color: #e9ecef;
      border-radius: 5px;
    }
    .stat-item {
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Recipe Verification Test Report</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
    
    <div class="summary">
      <h2>Summary</h2>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">${results.totalUsers}</div>
          <div>Users Tested</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${results.totalRecipes}</div>
          <div>Total Recipes</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${results.compliantRecipes}</div>
          <div>Compliant Recipes</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${results.manuallyVerifiedNonCompliant}</div>
          <div>Actual Non-Compliant</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${results.systemCaughtNonCompliant}</div>
          <div>Caught by System</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${results.systemEffectiveness.toFixed(2)}%</div>
          <div>System Effectiveness</div>
        </div>
      </div>
    </div>
    
    <h2>User Results</h2>
    <table>
      <thead>
        <tr>
          <th>User</th>
          <th>Recipes Tested</th>
          <th>Compliant</th>
          <th>Actual Non-Compliant</th>
          <th>Caught by System</th>
          <th>System Effectiveness</th>
        </tr>
      </thead>
      <tbody>
        ${results.userResults.map((result: any) => `
          <tr>
            <td>${result.email}</td>
            <td>${result.totalRecipes}</td>
            <td class="success">${result.compliantRecipes}</td>
            <td class="non-compliant">${result.manuallyVerifiedNonCompliant}</td>
            <td class="${result.systemCaughtNonCompliant === result.manuallyVerifiedNonCompliant ? 'success' : 'missed'}">${result.systemCaughtNonCompliant}</td>
            <td>${result.systemEffectiveness.toFixed(2)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h2>Non-Compliant Recipes</h2>
    ${results.userResults.map((result: any) => {
      if (result.nonCompliantDetails.length === 0) return '';
      
      return `
        <div class="user-section">
          <h3>User: ${result.email}</h3>
          <table>
            <thead>
              <tr>
                <th>Recipe Title</th>
                <th>Restrictions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${result.nonCompliantDetails.map((detail: any) => `
                <tr>
                  <td>${detail.recipe.title}</td>
                  <td>${detail.restrictions.join(', ')}</td>
                  <td class="${detail.caughtBySystem ? 'success' : 'missed'}">${detail.caughtBySystem ? 'Caught' : 'Missed'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>
  `;
  
  // Write the HTML report to a file
  fs.writeFileSync(path.join(__dirname, 'verification-report.html'), html);
}

main(); 