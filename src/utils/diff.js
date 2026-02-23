function diffParams(a = {}, b = {}) {
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
  const changes = [];
  for (const k of keys) {
    if (a[k] !== b[k]) {
      changes.push({ key: k, from: a[k], to: b[k] });
    }
  }
  return changes;
}

module.exports = { diffParams };
