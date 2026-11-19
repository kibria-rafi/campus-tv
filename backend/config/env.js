'use strict';

/**
 * Validates essential environment variables at application startup.
 * Fails fast with actionable error messages if critical variables are missing.
 */
function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';
  const missing = [];
  const warnings = [];

  // Critical for database and authentication
  if (!process.env.MONGO_URI) {
    missing.push('MONGO_URI (MongoDB connection string)');
  }
  if (!process.env.JWT_SECRET) {
    missing.push('JWT_SECRET (Secret key for JWT admin authentication)');
  } else if (process.env.JWT_SECRET.length < 16) {
    warnings.push('JWT_SECRET is short (< 16 characters). Use a stronger secret in production.');
  }

  // Recommended for seeding and YouTube
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS) {
    warnings.push('ADMIN_USER or ADMIN_PASS is not set. Admin account cannot be auto-seeded.');
  }
  if (!process.env.YOUTUBE_API_KEY) {
    warnings.push('YOUTUBE_API_KEY is not set. YouTube archive endpoints will return 500.');
  }

  if (warnings.length > 0) {
    warnings.forEach((w) => console.warn(`[Config Warning] ⚠️  ${w}`));
  }

  if (missing.length > 0) {
    console.error('\n[Config Error] ❌ Missing required environment variables:');
    missing.forEach((m) => console.error(`  - ${m}`));
    console.error('Please configure these in your .env file or host environment.\n');

    if (isProduction) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

module.exports = {
  validateEnv,
};
