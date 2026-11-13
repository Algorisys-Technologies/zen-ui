import { judgeMeasurement as c } from "./index130.js";
const d = (e, t) => t?.status === "done" || t?.status === "skipped" && e.optional === !0;
function m(e, t, o = {}) {
  const n = o.sequential ?? !0, s = e.findIndex((i) => !d(i, t[i.id])), r = e.map((i, a) => {
    const l = t[i.id];
    let u;
    return l?.status === "done" ? u = "done" : l?.status === "skipped" && i.optional ? u = "skipped" : a === s ? u = l?.status === "issue" ? "issue" : "current" : l?.status === "issue" ? u = "issue" : u = n && s >= 0 && a > s ? "locked" : "open", { id: i.id, status: u };
  });
  return {
    items: r,
    current: s < 0 ? null : e[s].id,
    doneCount: r.filter((i) => i.status === "done").length,
    total: e.length,
    complete: s < 0
  };
}
function k(e, t, o = {}) {
  if (e.checklist?.length) {
    const n = new Set(t.checked ?? []);
    if (!e.checklist.every((s) => n.has(s.id))) return { ok: !1, reason: "checklist" };
  }
  if (e.measure) {
    const n = t.value;
    if (n == null || !Number.isFinite(n)) return { ok: !1, reason: "measurement-missing" };
    if (!o.allowFailedMeasurement && c(n, e.measure.spec).verdict === "fail")
      return { ok: !1, reason: "measurement-fail" };
  }
  return { ok: !0, reason: null };
}
export {
  k as canCompleteStep,
  m as stepRunnerState
};
//# sourceMappingURL=index132.js.map
