import { evaluate as _, getSide as W, getSideAxis as F, getOppositePlacement as K, getExpandedPlacements as Q, getOppositeAxisPlacements as Z, getAlignmentSides as ee, clamp as Y, getAlignment as B, min as j, max as $, getPaddingObject as U, getAlignmentAxis as q, getOppositeAxis as te, sides as ne, getAxisLength as G, rectToClientRect as z } from "./index223.js";
function X(t, e, d) {
  let {
    reference: o,
    floating: f
  } = t;
  const n = F(e), i = q(e), s = G(i), g = W(e), x = n === "y", c = o.x + o.width / 2 - f.width / 2, r = o.y + o.height / 2 - f.height / 2, m = o[s] / 2 - f[s] / 2;
  let a;
  switch (g) {
    case "top":
      a = {
        x: c,
        y: o.y - f.height
      };
      break;
    case "bottom":
      a = {
        x: c,
        y: o.y + o.height
      };
      break;
    case "right":
      a = {
        x: o.x + o.width,
        y: r
      };
      break;
    case "left":
      a = {
        x: o.x - f.width,
        y: r
      };
      break;
    default:
      a = {
        x: o.x,
        y: o.y
      };
  }
  switch (B(e)) {
    case "start":
      a[i] -= m * (d && x ? -1 : 1);
      break;
    case "end":
      a[i] += m * (d && x ? -1 : 1);
      break;
  }
  return a;
}
async function ie(t, e) {
  var d;
  e === void 0 && (e = {});
  const {
    x: o,
    y: f,
    platform: n,
    rects: i,
    elements: s,
    strategy: g
  } = t, {
    boundary: x = "clippingAncestors",
    rootBoundary: c = "viewport",
    elementContext: r = "floating",
    altBoundary: m = !1,
    padding: a = 0
  } = _(e, t), l = U(a), h = s[m ? r === "floating" ? "reference" : "floating" : r], w = z(await n.getClippingRect({
    element: (d = await (n.isElement == null ? void 0 : n.isElement(h))) == null || d ? h : h.contextElement || await (n.getDocumentElement == null ? void 0 : n.getDocumentElement(s.floating)),
    boundary: x,
    rootBoundary: c,
    strategy: g
  })), v = r === "floating" ? {
    x: o,
    y: f,
    width: i.floating.width,
    height: i.floating.height
  } : i.reference, p = await (n.getOffsetParent == null ? void 0 : n.getOffsetParent(s.floating)), y = await (n.isElement == null ? void 0 : n.isElement(p)) ? await (n.getScale == null ? void 0 : n.getScale(p)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  }, O = z(n.convertOffsetParentRelativeRectToViewportRelativeRect ? await n.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: s,
    rect: v,
    offsetParent: p,
    strategy: g
  }) : v);
  return {
    top: (w.top - O.top + l.top) / y.y,
    bottom: (O.bottom - w.bottom + l.bottom) / y.y,
    left: (w.left - O.left + l.left) / y.x,
    right: (O.right - w.right + l.right) / y.x
  };
}
const oe = 50, ce = async (t, e, d) => {
  const {
    placement: o = "bottom",
    strategy: f = "absolute",
    middleware: n = [],
    platform: i
  } = d, s = i.detectOverflow ? i : {
    ...i,
    detectOverflow: ie
  }, g = await (i.isRTL == null ? void 0 : i.isRTL(e));
  let x = await i.getElementRects({
    reference: t,
    floating: e,
    strategy: f
  }), {
    x: c,
    y: r
  } = X(x, o, g), m = o, a = 0;
  const l = {};
  for (let u = 0; u < n.length; u++) {
    const h = n[u];
    if (!h)
      continue;
    const {
      name: w,
      fn: v
    } = h, {
      x: p,
      y,
      data: O,
      reset: A
    } = await v({
      x: c,
      y: r,
      initialPlacement: o,
      placement: m,
      strategy: f,
      middlewareData: l,
      rects: x,
      platform: s,
      elements: {
        reference: t,
        floating: e
      }
    });
    c = p ?? c, r = y ?? r, l[w] = {
      ...l[w],
      ...O
    }, A && a < oe && (a++, typeof A == "object" && (A.placement && (m = A.placement), A.rects && (x = A.rects === !0 ? await i.getElementRects({
      reference: t,
      floating: e,
      strategy: f
    }) : A.rects), {
      x: c,
      y: r
    } = X(x, m, g)), u = -1);
  }
  return {
    x: c,
    y: r,
    placement: m,
    strategy: f,
    middlewareData: l
  };
}, re = (t) => ({
  name: "arrow",
  options: t,
  async fn(e) {
    const {
      x: d,
      y: o,
      placement: f,
      rects: n,
      platform: i,
      elements: s,
      middlewareData: g
    } = e, {
      element: x,
      padding: c = 0
    } = _(t, e) || {};
    if (x == null)
      return {};
    const r = U(c), m = {
      x: d,
      y: o
    }, a = q(f), l = G(a), u = await i.getDimensions(x), h = a === "y", w = h ? "top" : "left", v = h ? "bottom" : "right", p = h ? "clientHeight" : "clientWidth", y = n.reference[l] + n.reference[a] - m[a] - n.floating[l], O = m[a] - n.reference[a], A = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(x));
    let R = A ? A[p] : 0;
    (!R || !await (i.isElement == null ? void 0 : i.isElement(A))) && (R = s.floating[p] || n.floating[l]);
    const E = y / 2 - O / 2, D = R / 2 - u[l] / 2 - 1, P = j(r[w], D), L = j(r[v], D), k = P, M = R - u[l] - L, b = R / 2 - u[l] / 2 + E, V = Y(k, b, M), T = !g.arrow && B(f) != null && b !== V && n.reference[l] / 2 - (b < k ? P : L) - u[l] / 2 < 0, S = T ? b < k ? b - k : b - M : 0;
    return {
      [a]: m[a] + S,
      data: {
        [a]: V,
        centerOffset: b - V - S,
        ...T && {
          alignmentOffset: S
        }
      },
      reset: T
    };
  }
}), fe = function(t) {
  return t === void 0 && (t = {}), {
    name: "flip",
    options: t,
    async fn(e) {
      var d, o;
      const {
        placement: f,
        middlewareData: n,
        rects: i,
        initialPlacement: s,
        platform: g,
        elements: x
      } = e, {
        mainAxis: c = !0,
        crossAxis: r = !0,
        fallbackPlacements: m,
        fallbackStrategy: a = "bestFit",
        fallbackAxisSideDirection: l = "none",
        flipAlignment: u = !0,
        ...h
      } = _(t, e);
      if ((d = n.arrow) != null && d.alignmentOffset)
        return {};
      const w = W(f), v = F(s), p = W(s) === s, y = await (g.isRTL == null ? void 0 : g.isRTL(x.floating)), O = m || (p || !u ? [K(s)] : Q(s)), A = l !== "none";
      !m && A && O.push(...Z(s, u, l, y));
      const R = [s, ...O], E = await g.detectOverflow(e, h), D = [];
      let P = ((o = n.flip) == null ? void 0 : o.overflows) || [];
      if (c && D.push(E[w]), r) {
        const b = ee(f, i, y);
        D.push(E[b[0]], E[b[1]]);
      }
      if (P = [...P, {
        placement: f,
        overflows: D
      }], !D.every((b) => b <= 0)) {
        var L, k;
        const b = (((L = n.flip) == null ? void 0 : L.index) || 0) + 1, V = R[b];
        if (V && (!(r === "alignment" ? v !== F(V) : !1) || // We leave the current main axis only if every placement on that axis
        // overflows the main axis.
        P.every((C) => F(C.placement) === v ? C.overflows[0] > 0 : !0)))
          return {
            data: {
              index: b,
              overflows: P
            },
            reset: {
              placement: V
            }
          };
        let T = (k = P.filter((S) => S.overflows[0] <= 0).sort((S, C) => S.overflows[1] - C.overflows[1])[0]) == null ? void 0 : k.placement;
        if (!T)
          switch (a) {
            case "bestFit": {
              var M;
              const S = (M = P.filter((C) => {
                if (A) {
                  const H = F(C.placement);
                  return H === v || // Create a bias to the `y` side axis due to horizontal
                  // reading directions favoring greater width.
                  H === "y";
                }
                return !0;
              }).map((C) => [C.placement, C.overflows.filter((H) => H > 0).reduce((H, J) => H + J, 0)]).sort((C, H) => C[1] - H[1])[0]) == null ? void 0 : M[0];
              S && (T = S);
              break;
            }
            case "initialPlacement":
              T = s;
              break;
          }
        if (f !== T)
          return {
            reset: {
              placement: T
            }
          };
      }
      return {};
    }
  };
};
function I(t, e) {
  return {
    top: t.top - e.height,
    right: t.right - e.width,
    bottom: t.bottom - e.height,
    left: t.left - e.width
  };
}
function N(t) {
  return ne.some((e) => t[e] >= 0);
}
const me = function(t) {
  return t === void 0 && (t = {}), {
    name: "hide",
    options: t,
    async fn(e) {
      const {
        rects: d,
        platform: o
      } = e, {
        strategy: f = "referenceHidden",
        ...n
      } = _(t, e);
      switch (f) {
        case "referenceHidden": {
          const i = await o.detectOverflow(e, {
            ...n,
            elementContext: "reference"
          }), s = I(i, d.reference);
          return {
            data: {
              referenceHiddenOffsets: s,
              referenceHidden: N(s)
            }
          };
        }
        case "escaped": {
          const i = await o.detectOverflow(e, {
            ...n,
            altBoundary: !0
          }), s = I(i, d.floating);
          return {
            data: {
              escapedOffsets: s,
              escaped: N(s)
            }
          };
        }
        default:
          return {};
      }
    }
  };
}, se = /* @__PURE__ */ new Set(["left", "top"]);
async function ae(t, e) {
  const {
    placement: d,
    platform: o,
    elements: f
  } = t, n = await (o.isRTL == null ? void 0 : o.isRTL(f.floating)), i = W(d), s = B(d), g = F(d) === "y", x = se.has(i) ? -1 : 1, c = n && g ? -1 : 1, r = _(e, t);
  let {
    mainAxis: m,
    crossAxis: a,
    alignmentAxis: l
  } = typeof r == "number" ? {
    mainAxis: r,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: r.mainAxis || 0,
    crossAxis: r.crossAxis || 0,
    alignmentAxis: r.alignmentAxis
  };
  return s && typeof l == "number" && (a = s === "end" ? l * -1 : l), g ? {
    x: a * c,
    y: m * x
  } : {
    x: m * x,
    y: a * c
  };
}
const de = function(t) {
  return t === void 0 && (t = 0), {
    name: "offset",
    options: t,
    async fn(e) {
      var d, o;
      const {
        x: f,
        y: n,
        placement: i,
        middlewareData: s
      } = e, g = await ae(e, t);
      return i === ((d = s.offset) == null ? void 0 : d.placement) && (o = s.arrow) != null && o.alignmentOffset ? {} : {
        x: f + g.x,
        y: n + g.y,
        data: {
          ...g,
          placement: i
        }
      };
    }
  };
}, ge = function(t) {
  return t === void 0 && (t = {}), {
    name: "shift",
    options: t,
    async fn(e) {
      const {
        x: d,
        y: o,
        placement: f,
        platform: n
      } = e, {
        mainAxis: i = !0,
        crossAxis: s = !1,
        limiter: g = {
          fn: (w) => {
            let {
              x: v,
              y: p
            } = w;
            return {
              x: v,
              y: p
            };
          }
        },
        ...x
      } = _(t, e), c = {
        x: d,
        y: o
      }, r = await n.detectOverflow(e, x), m = F(W(f)), a = te(m);
      let l = c[a], u = c[m];
      if (i) {
        const w = a === "y" ? "top" : "left", v = a === "y" ? "bottom" : "right", p = l + r[w], y = l - r[v];
        l = Y(p, l, y);
      }
      if (s) {
        const w = m === "y" ? "top" : "left", v = m === "y" ? "bottom" : "right", p = u + r[w], y = u - r[v];
        u = Y(p, u, y);
      }
      const h = g.fn({
        ...e,
        [a]: l,
        [m]: u
      });
      return {
        ...h,
        data: {
          x: h.x - d,
          y: h.y - o,
          enabled: {
            [a]: i,
            [m]: s
          }
        }
      };
    }
  };
}, ue = function(t) {
  return t === void 0 && (t = {}), {
    name: "size",
    options: t,
    async fn(e) {
      var d, o;
      const {
        placement: f,
        rects: n,
        platform: i,
        elements: s
      } = e, {
        apply: g = () => {
        },
        ...x
      } = _(t, e), c = await i.detectOverflow(e, x), r = W(f), m = B(f), a = F(f) === "y", {
        width: l,
        height: u
      } = n.floating;
      let h, w;
      r === "top" || r === "bottom" ? (h = r, w = m === (await (i.isRTL == null ? void 0 : i.isRTL(s.floating)) ? "start" : "end") ? "left" : "right") : (w = r, h = m === "end" ? "top" : "bottom");
      const v = u - c.top - c.bottom, p = l - c.left - c.right, y = j(u - c[h], v), O = j(l - c[w], p), A = !e.middlewareData.shift;
      let R = y, E = O;
      if ((d = e.middlewareData.shift) != null && d.enabled.x && (E = p), (o = e.middlewareData.shift) != null && o.enabled.y && (R = v), A && !m) {
        const P = $(c.left, 0), L = $(c.right, 0), k = $(c.top, 0), M = $(c.bottom, 0);
        a ? E = l - 2 * (P !== 0 || L !== 0 ? P + L : $(c.left, c.right)) : R = u - 2 * (k !== 0 || M !== 0 ? k + M : $(c.top, c.bottom));
      }
      await g({
        ...e,
        availableWidth: E,
        availableHeight: R
      });
      const D = await i.getDimensions(s.floating);
      return l !== D.width || u !== D.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
export {
  re as arrow,
  ce as computePosition,
  ie as detectOverflow,
  fe as flip,
  me as hide,
  de as offset,
  z as rectToClientRect,
  ge as shift,
  ue as size
};
//# sourceMappingURL=index222.js.map
