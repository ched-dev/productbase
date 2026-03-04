#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnv } from 'vite';
import PocketBase from 'pocketbase';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fake data generators
const fakeDataGenerators = {
  user_feedback: (pb) => {
    const feedbackTypes = ['bug', 'feature', 'question', 'general', 'other'];
    const messages = [
      'The login form is confusing',
      'Would love to see a dark mode',
      'How do I export my data?',
      'Great product!',
      'The search feature is slow',
      'Can we add keyboard shortcuts?',
      'Found a typo in the documentation',
      'The mobile experience needs work',
      'Love the new dashboard layout',
      'Request: bulk actions support'
    ];

    return {
      feedback_type: feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      reply_desired: Math.random() > 0.5,
      metadata: JSON.stringify({
        browser: 'Chrome',
        os: 'macOS',
        version: '1.0.0'
      })
    };
  },

  feedback_actions: async (pb) => {
    const actions = ['reviewed', 'responded', 'closed', 'escalated', 'archived'];

    // Get an existing user_feedback record
    const feedbackRecords = await pb.collection('user_feedback').getList(1, 1);
    if (feedbackRecords.items.length === 0) {
      throw new Error('No user_feedback records found. Please seed user_feedback first.');
    }

    return {
      user_feedback: feedbackRecords.items[0].id,
      action: actions[Math.floor(Math.random() * actions.length)]
    };
  },

  user_preferences: async (pb) => {
    const methods = ['email', 'sms', 'push', 'none'];

    // Get an existing user record
    const users = await pb.collection('users').getList(1, 1);
    if (users.items.length === 0) {
      throw new Error('No users found. Please ensure dev users are created via migrations.');
    }

    return {
      user: users.items[0].id,
      alert_preferred_method: methods[Math.floor(Math.random() * methods.length)],
      alert_phone_number: Math.random() > 0.5 ? `+1555${Math.floor(Math.random() * 9000000).toString().padStart(7, '0')}` : undefined,
      alert_phone_number_subscribed: Math.random() > 0.5
    };
  },

  organizations: async (pb) => {
    const names = [
      'Acme Corp', 'Globex Industries', 'Initech', 'Umbrella Co',
      'Stark Industries', 'Wayne Enterprises', 'Cyberdyne Systems',
      'Soylent Corp', 'Wonka Industries', 'Aperture Science'
    ];
    const descriptions = [
      'A leading provider of innovative solutions',
      'Building the future, one product at a time',
      'Enterprise software for modern teams',
      'Connecting people through technology',
      undefined
    ];

    // Get an existing user to serve as owner
    const users = await pb.collection('users').getList(1, 50);
    if (users.items.length === 0) {
      throw new Error('No users found. Please ensure dev users are created via migrations.');
    }
    const randomUser = users.items[Math.floor(Math.random() * users.items.length)];

    return {
      name: `${names[Math.floor(Math.random() * names.length)]} ${Date.now().toString(36)}`,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      owner: randomUser.id
    };
  },

  memberships: async (pb) => {
    const roles = ['owner', 'admin', 'member', 'member', 'member'];

    // Get an existing organization
    const orgs = await pb.collection('organizations').getList(1, 50);
    if (orgs.items.length === 0) {
      throw new Error('No organizations found. Please seed organizations first.');
    }
    const randomOrg = orgs.items[Math.floor(Math.random() * orgs.items.length)];

    // Get an existing user
    const users = await pb.collection('users').getList(1, 50);
    if (users.items.length === 0) {
      throw new Error('No users found. Please ensure dev users are created via migrations.');
    }
    const randomUser = users.items[Math.floor(Math.random() * users.items.length)];

    return {
      user: randomUser.id,
      organization: randomOrg.id,
      role: roles[Math.floor(Math.random() * roles.length)],
      invited_by: randomOrg.owner || randomUser.id
    };
  }
};

// Main
async function main() {
  const collection = process.env.COLLECTION;
  const count = parseInt(process.env.COUNT || '1', 10);

  if (!collection) {
    console.error('Error: COLLECTION environment variable is required');
    console.error('Usage: COLLECTION=<name> [COUNT=1] node tasks/seed-collection.mjs');
    console.error('Available collections:', Object.keys(fakeDataGenerators).join(', '));
    process.exit(1);
  }

  if (!fakeDataGenerators[collection]) {
    console.error(`Error: Unknown collection "${collection}"`);
    console.error('Available collections:', Object.keys(fakeDataGenerators).join(', '));
    process.exit(1);
  }

  if (count < 1) {
    console.error('Error: COUNT must be at least 1');
    process.exit(1);
  }

  try {
    // Load env
    const pbEnv = loadEnv('development', path.join(__dirname, '../../pocketbase'), '');
    const pbUrl = pbEnv.POCKETBASE_API_URL;
    const superuserEmail = pbEnv.DEV_SUPERUSER_EMAIL;
    const superuserPassword = pbEnv.DEV_SUPERUSER_PASSWORD;

    if (!pbUrl) {
      throw new Error('POCKETBASE_API_URL missing in pocketbase/.env');
    }
    if (!superuserEmail || !superuserPassword) {
      throw new Error('DEV_SUPERUSER_EMAIL or DEV_SUPERUSER_PASSWORD missing in pocketbase/.env');
    }

    // Initialize PocketBase
    const pb = new PocketBase(pbUrl);
    await pb.collection('_superusers').authWithPassword(superuserEmail, superuserPassword);

    // Seed records
    console.log(`\nSeeding ${count} record(s) into "${collection}"...`);
    const generator = fakeDataGenerators[collection];
    let created = 0;
    let errors = 0;

    for (let i = 0; i < count; i++) {
      try {
        const data = await generator(pb);
        const record = await pb.collection(collection).create(data);
        console.log(`✓ Created record: ${record.id}`);
        created++;
      } catch (e) {
        console.error(`✗ Failed to create record ${i + 1}: ${e.message}`);
        errors++;
      }
    }

    console.log(`\nDone! Created ${created}/${count} records.`);
    if (errors > 0) {
      console.warn(`⚠ ${errors} record(s) failed.`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
