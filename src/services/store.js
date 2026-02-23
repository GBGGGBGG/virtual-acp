const Redis = require('ioredis');

const KEY = 'gatex:state:v1';

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function createStore() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    return {
      type: 'memory',
      async load() {
        return null;
      },
      async save(_state) {
        return;
      },
      async health() {
        return { ok: true, type: 'memory' };
      },
    };
  }

  const client = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });

  return {
    type: 'redis',
    async load() {
      await client.connect().catch(() => {});
      const raw = await client.get(KEY);
      return raw ? safeParse(raw, null) : null;
    },
    async save(state) {
      await client.connect().catch(() => {});
      await client.set(KEY, JSON.stringify(state));
    },
    async health() {
      try {
        await client.connect().catch(() => {});
        const pong = await client.ping();
        return { ok: pong === 'PONG', type: 'redis' };
      } catch {
        return { ok: false, type: 'redis' };
      }
    },
  };
}

module.exports = { createStore };
