import * as d from "react";
import { clamp as q } from "./index209.js";
import { composeEventHandlers as C } from "./index191.js";
import { useComposedRefs as T } from "./index192.js";
import { createContextScope as ge } from "./index193.js";
import { useControllableState as be } from "./index202.js";
import { useDirection as ve } from "./index173.js";
import { usePrevious as we } from "./index215.js";
import { useSize as Pe } from "./index214.js";
import { Primitive as B } from "./index201.js";
import { createCollection as Re } from "./index217.js";
import { jsx as m, jsxs as xe, Fragment as ye } from "react/jsx-runtime";
var J = ["PageUp", "PageDown"], Q = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"], Z = {
  "from-left": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-right": ["Home", "PageDown", "ArrowDown", "ArrowRight"],
  "from-bottom": ["Home", "PageDown", "ArrowDown", "ArrowLeft"],
  "from-top": ["Home", "PageDown", "ArrowUp", "ArrowLeft"]
}, I = "Slider", [O, _e, Ee] = Re(I), [Y] = ge(I, [
  Ee
]), [De, K] = Y(I), Me = d.forwardRef(
  (e, t) => {
    const {
      name: n,
      min: o = 0,
      max: i = 100,
      step: r = 1,
      orientation: c = "horizontal",
      disabled: s = !1,
      minStepsBetweenThumbs: f = 0,
      defaultValue: u = [o],
      value: S,
      onValueChange: a = () => {
      },
      onValueCommit: l = () => {
      },
      inverted: b = !1,
      form: w,
      ...h
    } = e, v = d.useRef(/* @__PURE__ */ new Set()), g = d.useRef(0), R = d.useRef(!1), x = c === "horizontal" ? Ce : Te, [E, $] = d.useState(null), k = T(t, $), [_ = [], z] = be({
      prop: S,
      defaultProp: u,
      onChange: (p) => {
        [...v.current][g.current]?.focus({
          preventScroll: !0,
          focusVisible: R.current
        }), R.current = !1, a(p);
      }
    }), j = d.useRef(_), me = d.useRef(_);
    d.useEffect(() => {
      const p = w ? E?.ownerDocument.getElementById(w) : E?.closest("form");
      if (p instanceof HTMLFormElement) {
        const y = () => z(me.current);
        return p.addEventListener("reset", y), () => p.removeEventListener("reset", y);
      }
    }, [E, w, z]);
    function pe(p) {
      const y = He(_, p);
      V(p, y);
    }
    function Se(p) {
      V(p, g.current);
    }
    function he() {
      const p = j.current[g.current];
      _[g.current] !== p && l(_);
    }
    function V(p, y, { commit: F } = { commit: !1 }) {
      const X = fe(r), L = H(Math.round((p - o) / r) * r + o, X), A = q(L, [o, i]);
      z((M = []) => {
        const D = Ke(M, A, y);
        if (Fe(D, f * r)) {
          g.current = D.indexOf(A);
          const W = String(D) !== String(M);
          return W && F && l(D), W ? D : M;
        } else
          return M;
      });
    }
    return /* @__PURE__ */ m(
      De,
      {
        scope: e.__scopeSlider,
        name: n,
        disabled: s,
        min: o,
        max: i,
        valueIndexToChangeRef: g,
        thumbs: v.current,
        values: _,
        orientation: c,
        form: w,
        children: /* @__PURE__ */ m(O.Provider, { scope: e.__scopeSlider, children: /* @__PURE__ */ m(O.Slot, { scope: e.__scopeSlider, children: /* @__PURE__ */ m(
          x,
          {
            "aria-disabled": s,
            "data-disabled": s ? "" : void 0,
            ...h,
            ref: k,
            onPointerDown: C(h.onPointerDown, () => {
              s || (j.current = _, R.current = !1);
            }),
            min: o,
            max: i,
            inverted: b,
            onSlideStart: s ? void 0 : pe,
            onSlideMove: s ? void 0 : Se,
            onSlideEnd: s ? void 0 : he,
            onHomeKeyDown: () => {
              s || (R.current = !0, V(o, 0, { commit: !0 }));
            },
            onEndKeyDown: () => {
              s || (R.current = !0, V(i, _.length - 1, { commit: !0 }));
            },
            onStepKeyDown: ({ event: p, direction: y }) => {
              if (!s) {
                R.current = !0;
                const L = J.includes(p.key) || p.shiftKey && Q.includes(p.key) ? 10 : 1, A = g.current, M = _[A], D = Le(M, {
                  min: o,
                  step: r,
                  direction: y,
                  multiplier: L
                });
                V(D, A, { commit: !0 });
              }
            }
          }
        ) }) })
      }
    );
  }
);
Me.displayName = I;
var [ee, te] = Y(I, {
  startEdge: "left",
  endEdge: "right",
  size: "width",
  direction: 1
}), Ce = d.forwardRef(
  (e, t) => {
    const {
      min: n,
      max: o,
      dir: i,
      inverted: r,
      onSlideStart: c,
      onSlideMove: s,
      onSlideEnd: f,
      onStepKeyDown: u,
      ...S
    } = e, [a, l] = d.useState(null), b = T(t, l), w = d.useRef(void 0), h = ve(i), v = h === "ltr", g = v && !r || !v && r;
    function R(P) {
      const x = w.current || a.getBoundingClientRect(), E = [0, x.width], k = G(E, g ? [n, o] : [o, n]);
      return w.current = x, k(P - x.left);
    }
    return /* @__PURE__ */ m(
      ee,
      {
        scope: e.__scopeSlider,
        startEdge: g ? "left" : "right",
        endEdge: g ? "right" : "left",
        direction: g ? 1 : -1,
        size: "width",
        children: /* @__PURE__ */ m(
          ne,
          {
            dir: h,
            "data-orientation": "horizontal",
            ...S,
            ref: b,
            style: {
              ...S.style,
              "--radix-slider-thumb-transform": "translateX(-50%)"
            },
            onSlideStart: (P) => {
              const x = R(P.clientX);
              c?.(x);
            },
            onSlideMove: (P) => {
              const x = R(P.clientX);
              s?.(x);
            },
            onSlideEnd: () => {
              w.current = void 0, f?.();
            },
            onStepKeyDown: (P) => {
              const E = Z[g ? "from-left" : "from-right"].includes(P.key);
              u?.({ event: P, direction: E ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), Te = d.forwardRef(
  (e, t) => {
    const {
      min: n,
      max: o,
      inverted: i,
      onSlideStart: r,
      onSlideMove: c,
      onSlideEnd: s,
      onStepKeyDown: f,
      ...u
    } = e, S = d.useRef(null), a = T(t, S), l = d.useRef(void 0), b = !i;
    function w(h) {
      const v = l.current || S.current.getBoundingClientRect(), g = [0, v.height], P = G(g, b ? [o, n] : [n, o]);
      return l.current = v, P(h - v.top);
    }
    return /* @__PURE__ */ m(
      ee,
      {
        scope: e.__scopeSlider,
        startEdge: b ? "bottom" : "top",
        endEdge: b ? "top" : "bottom",
        size: "height",
        direction: b ? 1 : -1,
        children: /* @__PURE__ */ m(
          ne,
          {
            "data-orientation": "vertical",
            ...u,
            ref: a,
            style: {
              ...u.style,
              "--radix-slider-thumb-transform": "translateY(50%)"
            },
            onSlideStart: (h) => {
              const v = w(h.clientY);
              r?.(v);
            },
            onSlideMove: (h) => {
              const v = w(h.clientY);
              c?.(v);
            },
            onSlideEnd: () => {
              l.current = void 0, s?.();
            },
            onStepKeyDown: (h) => {
              const g = Z[b ? "from-bottom" : "from-top"].includes(h.key);
              f?.({ event: h, direction: g ? -1 : 1 });
            }
          }
        )
      }
    );
  }
), ne = d.forwardRef(
  (e, t) => {
    const {
      __scopeSlider: n,
      onSlideStart: o,
      onSlideMove: i,
      onSlideEnd: r,
      onHomeKeyDown: c,
      onEndKeyDown: s,
      onStepKeyDown: f,
      ...u
    } = e, S = K(I, n);
    return /* @__PURE__ */ m(
      B.span,
      {
        ...u,
        ref: t,
        onKeyDown: C(e.onKeyDown, (a) => {
          a.key === "Home" ? (c(a), a.preventDefault()) : a.key === "End" ? (s(a), a.preventDefault()) : J.concat(Q).includes(a.key) && (f(a), a.preventDefault());
        }),
        onPointerDown: C(e.onPointerDown, (a) => {
          const l = a.target;
          l.setPointerCapture(a.pointerId), a.preventDefault(), S.thumbs.has(l) ? l.focus({ preventScroll: !0, focusVisible: !1 }) : o(a);
        }),
        onPointerMove: C(e.onPointerMove, (a) => {
          a.target.hasPointerCapture(a.pointerId) && i(a);
        }),
        onPointerUp: C(e.onPointerUp, (a) => {
          const l = a.target;
          l.hasPointerCapture(a.pointerId) && (l.releasePointerCapture(a.pointerId), r(a));
        })
      }
    );
  }
), oe = "SliderTrack", Ie = d.forwardRef(
  (e, t) => {
    const { __scopeSlider: n, ...o } = e, i = K(oe, n);
    return /* @__PURE__ */ m(
      B.span,
      {
        "data-disabled": i.disabled ? "" : void 0,
        "data-orientation": i.orientation,
        ...o,
        ref: t
      }
    );
  }
);
Ie.displayName = oe;
var U = "SliderRange", Ve = d.forwardRef(
  (e, t) => {
    const { __scopeSlider: n, ...o } = e, i = K(U, n), r = te(U, n), c = d.useRef(null), s = T(t, c), f = i.values.length, u = i.values.map(
      (l) => ue(l, i.min, i.max)
    ), S = f > 1 ? Math.min(...u) : 0, a = 100 - Math.max(...u);
    return /* @__PURE__ */ m(
      B.span,
      {
        "data-orientation": i.orientation,
        "data-disabled": i.disabled ? "" : void 0,
        ...o,
        ref: s,
        style: {
          ...e.style,
          [r.startEdge]: S + "%",
          [r.endEdge]: a + "%"
        }
      }
    );
  }
);
Ve.displayName = U;
var re = "SliderThumb", [Ae, ie] = Y(re), se = "SliderThumbProvider";
function ae(e) {
  const {
    __scopeSlider: t,
    name: n,
    children: o,
    // @ts-expect-error internal render prop
    internal_do_not_use_render: i
  } = e, r = K(se, t), c = _e(t), [s, f] = d.useState(null), u = d.useMemo(
    () => s ? c().findIndex((v) => v.ref.current === s) : -1,
    [c, s]
  ), S = Pe(s), a = s ? !!r.form || !!s.closest("form") : !0, l = r.values[u], b = n ?? (r.name ? r.name + (r.values.length > 1 ? "[]" : "") : void 0), w = l === void 0 ? 0 : ue(l, r.min, r.max);
  d.useEffect(() => {
    if (s)
      return r.thumbs.add(s), () => {
        r.thumbs.delete(s);
      };
  }, [s, r.thumbs]);
  const h = {
    value: l,
    name: b,
    form: r.form,
    isFormControl: a,
    index: u,
    thumb: s,
    onThumbChange: f,
    percent: w,
    size: S
  };
  return /* @__PURE__ */ m(Ae, { scope: t, ...h, children: Oe(i) ? i(h) : o });
}
ae.displayName = se;
var N = "SliderThumbTrigger", ce = d.forwardRef(
  (e, t) => {
    const { __scopeSlider: n, ...o } = e, i = K(N, n), r = te(N, n), { index: c, value: s, percent: f, size: u, onThumbChange: S } = ie(
      N,
      n
    ), a = T(t, S), l = Ne(c, i.values.length), b = u?.[r.size], w = b ? ke(b, f, r.direction) : 0;
    return /* @__PURE__ */ m(
      "span",
      {
        style: {
          transform: "var(--radix-slider-thumb-transform)",
          position: "absolute",
          [r.startEdge]: `calc(${f}% + ${w}px)`
        },
        children: /* @__PURE__ */ m(O.ItemSlot, { scope: n, children: /* @__PURE__ */ m(
          B.span,
          {
            role: "slider",
            "aria-label": e["aria-label"] || l,
            "aria-valuemin": i.min,
            "aria-valuenow": s,
            "aria-valuemax": i.max,
            "aria-orientation": i.orientation,
            "data-orientation": i.orientation,
            "data-disabled": i.disabled ? "" : void 0,
            tabIndex: i.disabled ? void 0 : 0,
            ...o,
            ref: a,
            style: s === void 0 ? { display: "none" } : e.style,
            onFocus: C(e.onFocus, () => {
              i.valueIndexToChangeRef.current = c;
            })
          }
        ) })
      }
    );
  }
);
ce.displayName = N;
var Be = d.forwardRef(
  (e, t) => {
    const { __scopeSlider: n, name: o, ...i } = e;
    return /* @__PURE__ */ m(
      ae,
      {
        __scopeSlider: n,
        name: o,
        internal_do_not_use_render: ({ index: r, isFormControl: c }) => /* @__PURE__ */ xe(ye, { children: [
          /* @__PURE__ */ m(
            ce,
            {
              ...i,
              ref: t,
              __scopeSlider: n
            }
          ),
          c ? /* @__PURE__ */ m(
            de,
            {
              __scopeSlider: n
            },
            r
          ) : null
        ] })
      }
    );
  }
);
Be.displayName = re;
var le = "SliderBubbleInput", de = d.forwardRef(
  ({ __scopeSlider: e, ...t }, n) => {
    const { value: o, name: i, form: r } = ie(le, e), c = d.useRef(null), s = T(c, n), f = we(o);
    return d.useEffect(() => {
      const u = c.current;
      if (!u) return;
      const S = window.HTMLInputElement.prototype, l = Object.getOwnPropertyDescriptor(S, "value").set;
      if (f !== o && l) {
        const b = new Event("input", { bubbles: !0 });
        l.call(u, o), u.dispatchEvent(b);
      }
    }, [f, o]), /* @__PURE__ */ m(
      B.input,
      {
        style: { display: "none" },
        name: i,
        form: r,
        ...t,
        ref: s,
        defaultValue: o
      }
    );
  }
);
de.displayName = le;
function Ke(e = [], t, n) {
  const o = [...e];
  return o[n] = t, o.sort((i, r) => i - r);
}
function ue(e, t, n) {
  const r = 100 / (n - t) * (e - t);
  return q(r, [0, 100]);
}
function Ne(e, t) {
  return t > 2 ? `Value ${e + 1} of ${t}` : t === 2 ? ["Minimum", "Maximum"][e] : void 0;
}
function He(e, t) {
  if (e.length === 1) return 0;
  const n = e.map((i) => Math.abs(i - t)), o = Math.min(...n);
  return n.indexOf(o);
}
function ke(e, t, n) {
  const o = e / 2, r = G([0, 50], [0, o]);
  return (o - r(t) * n) * n;
}
function ze(e) {
  return e.slice(0, -1).map((t, n) => e[n + 1] - t);
}
function Fe(e, t) {
  if (t > 0) {
    const n = ze(e);
    return Math.min(...n) >= t;
  }
  return !0;
}
function G(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const o = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + o * (n - e[0]);
  };
}
function fe(e) {
  if (!Number.isFinite(e)) return 0;
  const t = e.toString();
  if (t.includes("e")) {
    const [o, i] = t.split("e"), r = o.split(".")[1] || "", c = Number(i);
    return Math.max(0, r.length - c);
  }
  const n = t.split(".")[1];
  return n ? n.length : 0;
}
function H(e, t) {
  const n = Math.pow(10, t);
  return Math.round(e * n) / n;
}
function Le(e, {
  min: t,
  step: n,
  direction: o,
  multiplier: i
}) {
  const r = fe(n), c = (e - t) / n, s = Math.round(c), f = H(s * n + t, r) === H(e, r);
  let u;
  return f ? u = s + i * o : o > 0 ? u = Math.ceil(c) : u = Math.floor(c), H(u * n + t, r);
}
function Oe(e) {
  return typeof e == "function";
}
export {
  Ve as Range,
  Me as Root,
  Me as Slider,
  Ve as SliderRange,
  Be as SliderThumb,
  Ie as SliderTrack,
  Be as Thumb,
  Ie as Track,
  de as unstable_BubbleInput,
  de as unstable_SliderBubbleInput,
  ae as unstable_SliderThumbProvider,
  ce as unstable_SliderThumbTrigger,
  ae as unstable_ThumbProvider,
  ce as unstable_ThumbTrigger
};
//# sourceMappingURL=index158.js.map
