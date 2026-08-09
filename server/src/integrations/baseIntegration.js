class BaseIntegration {
  constructor(provider, scopes) { this.provider = provider; this.scopes = scopes; }
  callbackUrl() { return `${require('../config/env').serverUrl}/api/integrations/oauth/${this.provider}/callback`; }
  async test() { return { ok: true, message: `${this.provider} connection record is active.` }; }
}
module.exports = BaseIntegration;
