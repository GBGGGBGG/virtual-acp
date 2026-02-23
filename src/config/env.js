const ENV = {
  REDIS_URL: process.env.REDIS_URL || '',
  REDIS_KEY_PREFIX: process.env.REDIS_KEY_PREFIX || 'gatex',
  REDIS_STATE_TTL_SEC: Number(process.env.REDIS_STATE_TTL_SEC || 0),
  GATEX_SIGNING_SECRET: process.env.GATEX_SIGNING_SECRET || 'gatex-dev-secret',
};

module.exports = { ENV };
