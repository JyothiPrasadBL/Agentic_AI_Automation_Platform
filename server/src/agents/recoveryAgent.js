function classify(error) {
  const message = String(error?.message || error || 'Unknown failure');
  if (/missing|required/i.test(message)) return 'MISSING_FIELDS';
  if (/auth.*expired/i.test(message)) return 'AUTH_EXPIRED';
  if (/not connected|integration/i.test(message)) return 'INTEGRATION_NOT_CONNECTED';
  if (/rate limit|429/i.test(message)) return 'RATE_LIMIT';
  if (/timeout|network|temporary|transient/i.test(message)) return 'TRANSIENT';
  return 'API_FAILURE';
}
function recover(error, retryCount, maxRetries = 3) {
  const classification = classify(error); const retryable = ['RATE_LIMIT', 'TRANSIENT', 'API_FAILURE'].includes(classification);
  return { classification, action: retryable && retryCount < maxRetries ? 'retry_with_backoff' : 'escalate', retryAfterMs: retryable ? 1000 * (2 ** retryCount) : null };
}
module.exports = { recover };
