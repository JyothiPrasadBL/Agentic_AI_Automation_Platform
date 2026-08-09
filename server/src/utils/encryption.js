const crypto = require('crypto');
const { credentialEncryptionKey } = require('../config/env');

function key() {
  if (!credentialEncryptionKey) { const error = new Error('CREDENTIAL_ENCRYPTION_KEY must be configured before storing OAuth tokens.'); error.code = 'ENCRYPTION_KEY_MISSING'; error.statusCode = 503; throw error; }
  return crypto.createHash('sha256').update(credentialEncryptionKey).digest();
}
function encrypt(value) { if (!value) return null; const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv); const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]); const tag = cipher.getAuthTag(); return [iv, tag, encrypted].map((part) => part.toString('base64url')).join('.'); }
function decrypt(value) { if (!value) return null; const [ivText, tagText, encryptedText] = value.split('.'); const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivText, 'base64url')); decipher.setAuthTag(Buffer.from(tagText, 'base64url')); return Buffer.concat([decipher.update(Buffer.from(encryptedText, 'base64url')), decipher.final()]).toString('utf8'); }
module.exports = { encrypt, decrypt };
