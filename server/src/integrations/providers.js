const BaseIntegration = require('./baseIntegration');
const env = require('../config/env');

class GoogleIntegration extends BaseIntegration {
  constructor(provider) { super(provider, provider === 'gmail' ? ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'] : ['https://www.googleapis.com/auth/spreadsheets']); }
  authUrl(state) { const params = new URLSearchParams({ client_id: env.googleClientId, redirect_uri: this.callbackUrl(), response_type: 'code', access_type: 'offline', prompt: 'consent', scope: this.scopes.join(' '), state }); return `https://accounts.google.com/o/oauth2/v2/auth?${params}`; }
  async exchange(code) { return tokenRequest('https://oauth2.googleapis.com/token', { code, client_id: env.googleClientId, client_secret: env.googleClientSecret, redirect_uri: this.callbackUrl(), grant_type: 'authorization_code' }); }
  configured() { return Boolean(env.googleClientId && env.googleClientSecret); }
}
class SlackIntegration extends BaseIntegration {
  constructor() { super('slack', ['chat:write', 'channels:read', 'app_mentions:read']); }
  authUrl(state) { return `https://slack.com/oauth/v2/authorize?${new URLSearchParams({ client_id: env.slackClientId, redirect_uri: this.callbackUrl(), scope: this.scopes.join(','), state })}`; }
  async exchange(code) { return tokenRequest('https://slack.com/api/oauth.v2.access', { code, client_id: env.slackClientId, client_secret: env.slackClientSecret, redirect_uri: this.callbackUrl() }); }
  configured() { return Boolean(env.slackClientId && env.slackClientSecret); }
}
class DiscordIntegration extends BaseIntegration {
  constructor() { super('discord', ['identify', 'messages.read']); }
  authUrl(state) { return `https://discord.com/oauth2/authorize?${new URLSearchParams({ client_id: env.discordClientId, redirect_uri: this.callbackUrl(), response_type: 'code', scope: this.scopes.join(' '), state })}`; }
  async exchange(code) { return tokenRequest('https://discord.com/api/oauth2/token', { code, client_id: env.discordClientId, client_secret: env.discordClientSecret, redirect_uri: this.callbackUrl(), grant_type: 'authorization_code' }); }
  configured() { return Boolean(env.discordClientId && env.discordClientSecret); }
}
async function tokenRequest(url, payload) { const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(payload) }); const data = await response.json(); if (!response.ok || data.ok === false) { const error = new Error(data.error_description || data.error || 'OAuth token exchange failed.'); error.statusCode = 502; throw error; } return { accessToken: data.access_token, refreshToken: data.refresh_token || null, expiresIn: data.expires_in || null, accountId: data.authed_user?.id || data.team?.id || null }; }
function getProvider(provider) { if (provider === 'gmail' || provider === 'google-sheets') return new GoogleIntegration(provider); if (provider === 'slack') return new SlackIntegration(); if (provider === 'discord') return new DiscordIntegration(); const error = new Error('Unsupported integration provider.'); error.statusCode = 404; throw error; }
module.exports = { getProvider, supportedProviders: ['gmail', 'slack', 'discord', 'google-sheets'] };
