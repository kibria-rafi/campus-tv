'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminCredentials = require('../models/AdminCredentials');
const { News } = require('../models/News');

async function seedAdminIfNeeded() {
  try {
    const existingAdmin = await AdminCredentials.findOne({
      username: process.env.ADMIN_USER,
    });
    if (!existingAdmin) {
      if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) {
        console.warn(
          '[Auth] ADMIN_USER or ADMIN_PASS env vars are missing — cannot seed admin account.'
        );
      } else {
        const hash = await bcrypt.hash(process.env.ADMIN_PASS, 12);
        await AdminCredentials.create({
          username: process.env.ADMIN_USER,
          passwordHash: hash,
        });
        console.log(
          `[Auth] Admin account seeded for user "${process.env.ADMIN_USER}".`
        );
      }
    }
  } catch (err) {
    console.error('[Auth] Error seeding admin account:', err);
  }
}

async function runMigrationsIfNeeded() {
  try {
    const migrated = await News.updateMany(
      { categories: { $exists: false } },
      { $set: { categories: [] } }
    );
    if (migrated.modifiedCount > 0) {
      console.log(
        `[Migration] Backfilled categories:[] on ${migrated.modifiedCount} news document(s).`
      );
    }
  } catch (err) {
    console.error('[Migration] Migration error:', err);
  }
}

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('[DB] MONGO_URI environment variable is not defined.');
    process.exit(1);
  }

  // Setup connection event listeners for resilience
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connection established.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
  });

  await mongoose.connect(uri);
  await runMigrationsIfNeeded();
  await seedAdminIfNeeded();
}

module.exports = {
  connectDB,
  seedAdminIfNeeded,
};
