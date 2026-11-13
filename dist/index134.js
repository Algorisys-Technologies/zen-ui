import { boardFreshness as a, DEFAULT_ANDON_STALE_MS as n } from "./index122.js";
function l(t) {
  const { stale: s, ageMs: e } = a(t.lastUpdated, t.now, t.staleAfterMs ?? n);
  return t.connected === !1 ? { state: "offline", ageMs: e } : e === null ? { state: "waiting", ageMs: e } : { state: s ? "stale" : "live", ageMs: e };
}
export {
  l as liveState
};
//# sourceMappingURL=index134.js.map
