import { computePosition as I, offset as J, shift as K, flip as N, size as Q, hide as T, arrow as z, limitShift as X } from "./index218.js";
import { autoUpdate as pe, platform as ge } from "./index218.js";
import * as f from "react";
import { useLayoutEffect as Y } from "react";
import * as Z from "react-dom";
var b = typeof document < "u", ee = function() {
}, w = b ? Y : ee;
function R(e, n) {
  if (e === n)
    return !0;
  if (typeof e != typeof n)
    return !1;
  if (typeof e == "function" && e.toString() === n.toString())
    return !0;
  let t, r, s;
  if (e && n && typeof e == "object") {
    if (Array.isArray(e)) {
      if (t = e.length, t !== n.length) return !1;
      for (r = t; r-- !== 0; )
        if (!R(e[r], n[r]))
          return !1;
      return !0;
    }
    if (s = Object.keys(e), t = s.length, t !== Object.keys(n).length)
      return !1;
    for (r = t; r-- !== 0; )
      if (!{}.hasOwnProperty.call(n, s[r]))
        return !1;
    for (r = t; r-- !== 0; ) {
      const p = s[r];
      if (!(p === "_owner" && e.$$typeof) && !R(e[p], n[p]))
        return !1;
    }
    return !0;
  }
  return e !== e && n !== n;
}
function A(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function L(e, n) {
  const t = A(e);
  return Math.round(n * t) / t;
}
function k(e) {
  const n = f.useRef(e);
  return w(() => {
    n.current = e;
  }), n;
}
function fe(e) {
  e === void 0 && (e = {});
  const {
    placement: n = "bottom",
    strategy: t = "absolute",
    middleware: r = [],
    platform: s,
    elements: {
      reference: p,
      floating: q
    } = {},
    transform: D = !0,
    whileElementsMounted: E,
    open: x
  } = e, [i, C] = f.useState({
    x: 0,
    y: 0,
    strategy: t,
    placement: n,
    middlewareData: {},
    isPositioned: !1
  }), [M, B] = f.useState(r);
  R(M, r) || B(r);
  const [U, V] = f.useState(null), [W, G] = f.useState(null), O = f.useCallback((o) => {
    o !== a.current && (a.current = o, V(o));
  }, []), _ = f.useCallback((o) => {
    o !== m.current && (m.current = o, G(o));
  }, []), u = p || U, l = q || W, a = f.useRef(null), m = f.useRef(null), y = f.useRef(i), H = E != null, S = k(E), P = k(s), v = k(x), g = f.useCallback(() => {
    if (!a.current || !m.current)
      return;
    const o = {
      placement: n,
      strategy: t,
      middleware: M
    };
    P.current && (o.platform = P.current), I(a.current, m.current, o).then((h) => {
      const d = {
        ...h,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: v.current !== !1
      };
      $.current && !R(y.current, d) && (y.current = d, Z.flushSync(() => {
        C(d);
      }));
    });
  }, [M, n, t, P, v]);
  w(() => {
    x === !1 && y.current.isPositioned && (y.current.isPositioned = !1, C((o) => ({
      ...o,
      isPositioned: !1
    })));
  }, [x]);
  const $ = f.useRef(!1);
  w(() => ($.current = !0, () => {
    $.current = !1;
  }), []), w(() => {
    if (u && (a.current = u), l && (m.current = l), u && l) {
      if (S.current)
        return S.current(u, l, g);
      g();
    }
  }, [u, l, g, S, H]);
  const F = f.useMemo(() => ({
    reference: a,
    floating: m,
    setReference: O,
    setFloating: _
  }), [O, _]), c = f.useMemo(() => ({
    reference: u,
    floating: l
  }), [u, l]), j = f.useMemo(() => {
    const o = {
      position: t,
      left: 0,
      top: 0
    };
    if (!c.floating)
      return o;
    const h = L(c.floating, i.x), d = L(c.floating, i.y);
    return D ? {
      ...o,
      transform: "translate(" + h + "px, " + d + "px)",
      ...A(c.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: t,
      left: h,
      top: d
    };
  }, [t, D, c.floating, i.x, i.y]);
  return f.useMemo(() => ({
    ...i,
    update: g,
    refs: F,
    elements: c,
    floatingStyles: j
  }), [i, g, F, c, j]);
}
const te = (e) => {
  function n(t) {
    return {}.hasOwnProperty.call(t, "current");
  }
  return {
    name: "arrow",
    options: e,
    fn(t) {
      const {
        element: r,
        padding: s
      } = typeof e == "function" ? e(t) : e;
      return r && n(r) ? r.current != null ? z({
        element: r.current,
        padding: s
      }).fn(t) : {} : r ? z({
        element: r,
        padding: s
      }).fn(t) : {};
    }
  };
}, oe = (e, n) => {
  const t = J(e);
  return {
    name: t.name,
    fn: t.fn,
    options: [e, n]
  };
}, se = (e, n) => {
  const t = K(e);
  return {
    name: t.name,
    fn: t.fn,
    options: [e, n]
  };
}, ie = (e, n) => ({
  fn: X(e).fn,
  options: [e, n]
}), ue = (e, n) => {
  const t = N(e);
  return {
    name: t.name,
    fn: t.fn,
    options: [e, n]
  };
}, le = (e, n) => {
  const t = Q(e);
  return {
    name: t.name,
    fn: t.fn,
    options: [e, n]
  };
}, ce = (e, n) => {
  const t = T(e);
  return {
    name: t.name,
    fn: t.fn,
    options: [e, n]
  };
}, ae = (e, n) => {
  const t = te(e);
  return {
    name: t.name,
    fn: t.fn,
    options: [e, n]
  };
};
export {
  ae as arrow,
  pe as autoUpdate,
  I as computePosition,
  ue as flip,
  ce as hide,
  ie as limitShift,
  oe as offset,
  ge as platform,
  se as shift,
  le as size,
  fe as useFloating
};
//# sourceMappingURL=index216.js.map
