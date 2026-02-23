const crypto = require('crypto');
const { ENV } = require('../config/env');

function signPayload(payload) {
  const raw = JSON.stringify(payload);
  return crypto.createHmac('sha256', ENV.GATEX_SIGNING_SECRET).update(raw).digest('hex');
}

module.exports = { signPayload };
