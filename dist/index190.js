import * as e from "react";
import { prunePivotFilterWindows as M, pivotFilterMissingWindowStarts as N, pickNearestWindowStart as P, VIRTUAL_SCROLL_FETCH_DEBOUNCE_MS as L, PIVOT_FILTER_LEADING_OVERSCAN_SLACK as b, alignWindowStart as V } from "./index189.js";
function D(n) {
  const [_, S] = e.useState([]), [k, v] = e.useState(0), [A, R] = e.useState(!1), [z, E] = e.useState(!1), [F, h] = e.useState(!1), u = e.useRef(0), o = e.useRef(/* @__PURE__ */ new Set()), r = e.useRef({ minIndex: 0, maxIndex: 0 }), l = e.useRef(null), d = e.useRef(n);
  d.current = n;
  const m = e.useCallback(() => {
    u.current += 1, o.current.clear(), S([]), v(0), h(!1);
  }, []), s = e.useCallback(async (t, c) => {
    const { pageSize: f, loadPage: g, search: x } = d.current;
    if (o.current.has(t)) return;
    o.current.add(t);
    const i = u.current;
    c ? R(!0) : E(!0);
    try {
      const a = await g(t, f, x);
      if (i !== u.current) return;
      h(!1), v(a.total), S((I) => {
        const W = I.filter((w) => w.startIndex !== t).concat({ startIndex: t, values: a.values });
        return W.sort((w, y) => w.startIndex - y.startIndex), M(W, r.current.minIndex, r.current.maxIndex, f);
      });
    } catch {
      if (i !== u.current) return;
      h(!0);
    } finally {
      o.current.delete(t), i === u.current && (c ? R(!1) : E(!1));
    }
  }, []), T = e.useCallback(() => {
    const { pageSize: t, isActive: c } = d.current;
    if (!c) return;
    const { minIndex: f, maxIndex: g } = r.current;
    S((x) => {
      const i = N(x, f, g, t).filter(
        (a) => !o.current.has(a)
      );
      if (i.length) {
        const a = (f + g) / 2, I = P(i, a, t);
        I !== void 0 && s(I, x.length === 0);
      }
      return x;
    });
  }, [s]), C = e.useCallback(() => {
    l.current && clearTimeout(l.current), l.current = setTimeout(T, L);
  }, [T]), O = e.useCallback(
    (t, c) => {
      r.current = {
        minIndex: Math.max(0, t - b),
        maxIndex: c + b
      }, C();
    },
    [C]
  ), p = e.useCallback(() => {
    m(), r.current = { minIndex: 0, maxIndex: d.current.pageSize - 1 }, s(V(0, d.current.pageSize), !0);
  }, [m, s]);
  return e.useEffect(() => {
    if (!n.isActive) return;
    m();
    const t = setTimeout(() => {
      r.current = { minIndex: 0, maxIndex: n.pageSize - 1 }, s(0, !0);
    }, L);
    return () => clearTimeout(t);
  }, [n.search, n.isActive, n.pageSize, m, s]), e.useEffect(
    () => () => {
      l.current && clearTimeout(l.current);
    },
    []
  ), { loading: A, loadingWindow: z, optionsWindows: _, totalCount: k, loadError: F, handleVisibleRange: O, scheduleFetch: C, openPanelFetch: p };
}
export {
  D as useWindowedOptionPages
};
//# sourceMappingURL=index190.js.map
