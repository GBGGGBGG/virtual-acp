const express = require('express');
const fs = require('fs');
const { LOG_FILE } = require('../services/logger');

const router = express.Router();

function readRecent(limit = 5000) {
  if (!fs.existsSync(LOG_FILE)) return [];
  const lines = fs.readFileSync(LOG_FILE, 'utf-8').trim().split('\n').filter(Boolean);
  const tail = lines.slice(-limit);
  return tail.map((x) => {
    try { return JSON.parse(x); } catch { return null; }
  }).filter(Boolean);
}

router.get('/report/stability', (req, res) => {
  const minutes = Math.min(Math.max(Number(req.query.minutes || 120), 10), 1440);
  const since = Date.now() - minutes * 60 * 1000;
  const events = readRecent().filter((e) => e.kind === 'gate.evaluate' && new Date(e.ts).getTime() >= since);

  const buckets = new Map();
  for (const e of events) {
    const ts = new Date(e.ts);
    ts.setSeconds(0, 0);
    const key = ts.toISOString();
    if (!buckets.has(key)) buckets.set(key, { t: key, total: 0, allow: 0, deny: 0, avgVerification: 0 });
    const b = buckets.get(key);
    b.total += 1;
    if (e.decision === 'ALLOW') b.allow += 1; else b.deny += 1;
    b.avgVerification += Number(e.verification_score || 0);
  }

  const series = Array.from(buckets.values()).sort((a, b) => a.t.localeCompare(b.t)).map((b) => ({
    ...b,
    allowRate: Number((b.allow / Math.max(b.total, 1)).toFixed(4)),
    denyRate: Number((b.deny / Math.max(b.total, 1)).toFixed(4)),
    avgVerification: Number((b.avgVerification / Math.max(b.total, 1)).toFixed(4)),
  }));

  res.json({ minutes, points: series.length, series });
});

module.exports = router;
