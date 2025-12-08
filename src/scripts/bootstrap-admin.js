#!/usr/bin/env node

/**
 * Bootstrap Admin User Creation Script
 * 
 * This script creates the first admin user in the system.
 * It can only be used when no admin users exist.
 * 
 * Usage: node bootstrap-admin.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n=== SA Municipal Portal - Bootstrap Admin ===\n');
  
  // Get Supabase project details from environment or prompt
  let projectId = process.env.SUPABASE_PROJECT_ID;
  let anonKey = process.env.SUPABASE_ANON_KEY;
  
  if (!projectId) {
    projectId = await question('Enter your Supabase Project ID: ');
  }
  
  if (!anonKey) {
    anonKey = await question('Enter your Supabase Anon Key: ');
  }
  
  console.log('\n--- Admin User Details ---\n');
  const email = await question('Admin Email: ');
  const password = await question('Admin Password: ');
  const name = await question('Admin Name: ');
  
  console.log('\nCreating admin user...');
  
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-4c8674b4/bootstrap-admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify({ email, password, name })
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('\n✅ SUCCESS!');
      console.log(`Admin user created: ${data.user.email}`);
      console.log(`Name: ${data.user.name}`);
      console.log(`Role: ${data.user.role}`);
      console.log('\nYou can now login with these credentials.');
    } else {
      console.log('\n❌ ERROR:');
      console.log(data.error);
      
      if (data.error.includes('Admin already exists')) {
        console.log('\nUse the admin panel to create additional admin users.');
      }
    }
  } catch (error) {
    console.log('\n❌ ERROR:');
    console.log(error.message);
  }
  
  rl.close();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
