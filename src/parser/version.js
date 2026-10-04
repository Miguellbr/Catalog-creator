export function normalizeVersion(value) {
  if (!value) return null;

  const match = String(value).match(/\d+(?:\.\d+)*/);
  return match ? match[0] : null;
}

export function compareVersions(a, b) {
  const aa = normalizeVersion(a);
  const bb = normalizeVersion(b);

  if (!aa && !bb) return 0;
  if (!aa) return -1;
  if (!bb) return 1;

  const left = aa.split(".").map(Number);
  const right = bb.split(".").map(Number);
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i++) {
    const l = left[i] ?? 0;
    const r = right[i] ?? 0;
    if (l !== r) return l > r ? 1 : -1;
  }

  return 0;
}
