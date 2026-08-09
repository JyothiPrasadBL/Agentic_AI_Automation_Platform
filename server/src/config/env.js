const path = require('path');

require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const requiredInProduction = ['JWT_SECRET', 'CREDENTIAL_ENCRYPTION_KEY'];

if (process.env.NODE_ENV === 'production') {
  for (const name of requiredInProduction) {
    if (!process.env[name]) throw new Error(`${name} must be set in production`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'development-only-secret-change-me',
  mongoUri: process.env.MONGODB_URI || '',
  credentialEncryptionKey: process.env.CREDENTIAL_ENCRYPTION_KEY || '',
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  serverUrl: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`,
  googleClientId: process.env.GOOGLE_CLIENT_ID || '', googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  slackClientId: process.env.SLACK_CLIENT_ID || '', slackClientSecret: process.env.SLACK_CLIENT_SECRET || '',
  discordClientId: process.env.DISCORD_CLIENT_ID || '', discordClientSecret: process.env.DISCORD_CLIENT_SECRET || ''
  ,redisUrl: process.env.REDIS_URL || ''
};
