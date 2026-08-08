const M = 5242880, _ = 3;
const F = (t, n = 5242880) => {
  if (!Number.isFinite(t) || t <= 0) return [];
  const r = Number.isFinite(n) && n > 0 ? Math.floor(n) : 5242880, s = [];
  for (let o = 0, A = 0; o < t; o += r, A++)
    s.push({ index: A, start: o, end: Math.min(o + r, t) });
  return s;
}, e = (t, n = 3) => t < n, a = (t, n = 500) => {
  const r = Math.max(1, Math.floor(t));
  return Math.min(3e4, n * 2 ** (r - 1));
}, T = (t, n) => n <= 0 ? 100 : Math.round(Math.min(100, Math.max(0, t / n * 100)));
export {
  M as DEFAULT_CHUNK_SIZE,
  _ as DEFAULT_MAX_ATTEMPTS,
  a as nextAttemptDelay,
  F as planChunks,
  e as shouldRetry,
  T as uploadProgress
};
//# sourceMappingURL=index110.js.map
