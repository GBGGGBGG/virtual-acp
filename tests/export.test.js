const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const exportRoute = require('../src/routes/export');

function app() {
  const a = express();
  a.use('/api', exportRoute);
  return a;
}

test('report export csv works', async () => {
  const a = app();
  const server = a.listen(0);
  const port = server.address().port;

  const res = await fetch(`http://localhost:${port}/api/report/export?format=csv`);
  const text = await res.text();
  server.close();

  assert.equal(res.status, 200);
  assert.ok(text.includes('key,value'));
});
