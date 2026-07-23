import { createSignal as f, onCleanup as P } from "solid-js";
import { pivotFilterWindowCoversRange as V, VIRTUAL_SCROLL_FETCH_DEBOUNCE_MS as U, prunePivotFilterWindows as N, pivotFilterMissingWindowStarts as q, pickNearestWindowStart as x } from "./index193.js";
const B = 300;
function G(a) {
  const [h, C] = f(!1), [b, c] = f(!1), [m, v] = f([]), [L, E] = f(0), [S, w] = f(null);
  let r, u, s = null, d = 0;
  const l = /* @__PURE__ */ new Set(), _ = () => a.isActive?.() ?? !0;
  function g() {
    v([]), E(0), w(null), l.clear(), s = null;
  }
  function R(e, n) {
    v((t) => {
      const i = N(
        t,
        e,
        n,
        a.pageSize
      );
      return i.length === t.length && i.every(
        (o, W) => o.startIndex === t[W]?.startIndex
      ) ? t : i;
    });
  }
  function p() {
    u && clearTimeout(u), u = setTimeout(() => {
      u = void 0, A();
    }, U);
  }
  function M(e) {
    const { startIndex: n, page: t, previousTotal: i } = e, o = t.total ?? t.values.length;
    return t.values.length === 0 && n > 0 ? Math.min(o > 0 ? o : i, n) : n === 0 || o > 0 ? o : i;
  }
  async function T(e, n = !1) {
    const t = ++d;
    l.add(e), n ? (C(!0), w(null)) : c(!0);
    try {
      const i = a.getSearch(), o = await a.loadPage(e, a.pageSize, i);
      if (t !== d)
        return;
      v((F) => [...F.filter(
        (O) => O.startIndex !== e
      ), { startIndex: e, values: o.values }]);
      const W = M;
      E(
        (F) => W({ startIndex: e, page: o, previousTotal: F })
      ), s && R(s.min, s.max);
    } catch (i) {
      if (t !== d)
        return;
      if (n) {
        g();
        const o = i instanceof Error ? i.message : "Failed to load options.";
        w(o);
      }
    } finally {
      l.delete(e);
      const i = t === d, o = l.size === 0;
      (i || o) && (n && i && C(!1), o && (c(!1), p()));
    }
  }
  function y(e) {
    r && clearTimeout(r), r = setTimeout(() => {
      r = void 0, g(), T(0, !0);
    }, B);
  }
  function z() {
    g(), T(0, !0);
  }
  function A() {
    const e = s;
    if (!e || !_() || h() || S() || l.size > 0) {
      l.size === 0 && c(!1);
      return;
    }
    const n = q(
      m(),
      e.min,
      e.max,
      a.pageSize
    );
    if (n.length === 0) {
      R(e.min, e.max), l.size === 0 && c(!1);
      return;
    }
    const t = x(
      n,
      Math.floor((e.min + e.max) / 2),
      a.pageSize
    );
    l.has(t) || T(t);
  }
  function D(e, n) {
    const t = s && s.min === e && s.max === n;
    s = { min: e, max: n }, !t && (!h() && !S() && !V(
      m(),
      e,
      n,
      a.pageSize
    ) && c(!0), p());
  }
  return P(() => {
    r && clearTimeout(r), u && clearTimeout(u);
  }), {
    loading: h,
    loadingWindow: b,
    optionsWindows: m,
    totalCount: L,
    loadError: S,
    handleVisibleRange: D,
    scheduleFetch: y,
    openPanelFetch: z,
    resetListState: g,
    reload: z
  };
}
export {
  G as useWindowedOptionPages
};
//# sourceMappingURL=index199.js.map
