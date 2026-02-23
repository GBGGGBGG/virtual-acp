const test = require('node:test');
const assert = require('node:assert/strict');
const { diffParams } = require('../src/utils/diff');

test('diffParams returns changed keys', () => {
  const out = diffParams({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 });
  const keys = out.map((x) => x.key);
  assert.deepEqual(keys, ['b', 'c']);
});
