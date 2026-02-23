const fs = require('fs');
const path = require('path');

const LOG_DIR = process.env.GATEX_LOG_DIR || path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'gatex-events.jsonl');

function ensureDir() {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function logEvent(event) {
  try {
    ensureDir();
    fs.appendFileSync(LOG_FILE, JSON.stringify({ ts: new Date().toISOString(), ...event }) + '\n');
  } catch {
    // best effort logging
  }
}

module.exports = { logEvent, LOG_FILE };
