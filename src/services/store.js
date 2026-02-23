const Redis = require('ioredis');
const { ENV } = require('../config/env');

const KEY = `${ENV.REDIS_KEY_PREFIX}:state:v1`;
const VERSION_LIST_KEY = `${ENV.REDIS_KEY_PREFIX}:policy_versions:v1`;
const VERSION_SEEN_KEY = `${ENV.REDIS_KEY_PREFIX}:policy_versions_seen:v1`;
const VERSION_LIST_MAX = 200;

function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

function createStore() {
  const redisUrl = ENV.REDIS_URL;

  if (!redisUrl) {
    const versions = [];
    return {
      type: 'memory',
      async load() {
        return null;
      },
      async save(_state) {
        return;
      },
      async pushVersion(version) {
        if (!version || !version.ts) return;
        if (versions.find((v) => v.ts === version.ts)) return;
        versions.unshift(version);
        if (versions.length > VERSION_LIST_MAX) versions.length = VERSION_LIST_MAX;
      },
      async getVersionHistory(limit = 20) {
        return versions.slice(0, Math.max(1, Math.min(Number(limit) || 20, VERSION_LIST_MAX)));
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
      const payload = JSON.stringify(state);
      if (ENV.REDIS_STATE_TTL_SEC > 0) {
        await client.set(KEY, payload, 'EX', ENV.REDIS_STATE_TTL_SEC);
      } else {
        await client.set(KEY, payload);
      }
    },
    async pushVersion(version) {
      if (!version || !version.ts) return;
      await client.connect().catch(() => {});
      const added = await client.sadd(VERSION_SEEN_KEY, version.ts);
      if (!added) return;
      await client.lpush(VERSION_LIST_KEY, JSON.stringify(version));
      await client.ltrim(VERSION_LIST_KEY, 0, VERSION_LIST_MAX - 1);
    },
    async getVersionHistory(limit = 20) {
      await client.connect().catch(() => {});
      const safeLimit = Math.max(1, Math.min(Number(limit) || 20, VERSION_LIST_MAX));
      const rows = await client.lrange(VERSION_LIST_KEY, 0, safeLimit - 1);
      return rows.map((x) => safeParse(x, null)).filter(Boolean);
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
