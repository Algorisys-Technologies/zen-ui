import { machineStateTone as u } from "./index116.js";
const i = (e) => typeof e == "number" ? e : e.getTime();
function l(e) {
  return e !== "running" && e !== "idle";
}
const a = ["down", "unknown", "setup", "planned", "idle", "running"];
function m(e) {
  const t = (n) => a.indexOf(n.tone ?? u(n.state));
  return e.map((n, o) => ({ x: n, i: o })).sort((n, o) => {
    const s = t(n.x) - t(o.x);
    if (s) return s;
    const r = n.x.since === void 0 ? 1 / 0 : i(n.x.since), c = o.x.since === void 0 ? 1 / 0 : i(o.x.since);
    return r - c || n.i - o.i;
  }).map(({ x: n }) => n);
}
const f = 12e4;
function x(e, t, n = f) {
  if (e === void 0) return { stale: !1, ageMs: null };
  const o = Math.max(0, i(t) - i(e));
  return { stale: o > n, ageMs: o };
}
export {
  a as ANDON_TONE_ORDER,
  f as DEFAULT_ANDON_STALE_MS,
  l as andonShowsClock,
  x as boardFreshness,
  m as sortAndonTiles
};
//# sourceMappingURL=index122.js.map
