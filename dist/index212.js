import * as s from "react";
import { composeEventHandlers as b } from "./index194.js";
import { createCollection as V } from "./index209.js";
import { useComposedRefs as j } from "./index192.js";
import { createContextScope as z } from "./index195.js";
import { useId as q } from "./index199.js";
import { Primitive as G } from "./index203.js";
import { useCallbackRef as J } from "./index207.js";
import { useControllableState as Q } from "./index204.js";
import { useDirection as W } from "./index171.js";
import { useLayoutEffect as X } from "./index208.js";
import { useIsHydrated as Z } from "./index220.js";
import { jsx as m } from "react/jsx-runtime";
var _ = "rovingFocusGroup.onEntryFocus", $ = { bubbles: !1, cancelable: !0 }, g = "RovingFocusGroup", [D, N, ee] = V(g), [oe, Te] = z(
  g,
  [ee]
), [te, re] = oe(g), O = s.forwardRef(
  (e, r) => /* @__PURE__ */ m(D.Provider, { scope: e.__scopeRovingFocusGroup, children: /* @__PURE__ */ m(D.Slot, { scope: e.__scopeRovingFocusGroup, children: /* @__PURE__ */ m(ne, { ...e, ref: r }) }) })
);
O.displayName = g;
var ne = s.forwardRef((e, r) => {
  const {
    __scopeRovingFocusGroup: c,
    orientation: o,
    loop: C = !1,
    dir: S,
    currentTabStopId: F,
    defaultCurrentTabStopId: y,
    onCurrentTabStopIdChange: h,
    onEntryFocus: p,
    preventScrollOnEntryFocus: u = !1,
    ...R
  } = e, E = s.useRef(null), v = j(r, E), I = W(S), [T, l] = Q({
    prop: F,
    defaultProp: y ?? null,
    onChange: h,
    caller: g
  }), [t, f] = s.useState(!1), w = J(p), i = N(c), a = s.useRef(!1), [k, P] = s.useState(0);
  return s.useEffect(() => {
    const n = E.current;
    if (n)
      return n.addEventListener(_, w), () => n.removeEventListener(_, w);
  }, [w]), /* @__PURE__ */ m(
    te,
    {
      scope: c,
      orientation: o,
      dir: I,
      loop: C,
      currentTabStopId: T,
      onItemFocus: s.useCallback(
        (n) => l(n),
        [l]
      ),
      onItemShiftTab: s.useCallback(() => f(!0), []),
      onFocusableItemAdd: s.useCallback(
        () => P((n) => n + 1),
        []
      ),
      onFocusableItemRemove: s.useCallback(
        () => P((n) => n - 1),
        []
      ),
      children: /* @__PURE__ */ m(
        G.div,
        {
          tabIndex: t || k === 0 ? -1 : 0,
          "data-orientation": o,
          ...R,
          ref: v,
          style: { outline: "none", ...e.style },
          onMouseDown: b(e.onMouseDown, () => {
            a.current = !0;
          }),
          onFocus: b(e.onFocus, (n) => {
            const U = !a.current;
            if (n.target === n.currentTarget && U && !t) {
              const x = new CustomEvent(_, $);
              if (n.currentTarget.dispatchEvent(x), !x.defaultPrevented) {
                const A = i().filter((d) => d.focusable), B = A.find((d) => d.active), H = A.find((d) => d.id === T), Y = [B, H, ...A].filter(
                  Boolean
                ).map((d) => d.ref.current);
                M(Y, u);
              }
            }
            a.current = !1;
          }),
          onBlur: b(e.onBlur, () => f(!1))
        }
      )
    }
  );
}), K = "RovingFocusGroupItem", L = s.forwardRef(
  (e, r) => {
    const {
      __scopeRovingFocusGroup: c,
      focusable: o = !0,
      active: C = !1,
      tabStopId: S,
      children: F,
      ...y
    } = e, h = q(), p = S || h, u = re(K, c), R = u.currentTabStopId === p, E = N(c), { onFocusableItemAdd: v, onFocusableItemRemove: I, currentTabStopId: T } = u, l = Z();
    return X(() => {
      if (!(!l || !o))
        return v(), () => I();
    }, [l, o, v, I]), s.useEffect(() => {
      if (!(l || !o))
        return v(), () => I();
    }, [l, o, v, I]), /* @__PURE__ */ m(
      D.ItemSlot,
      {
        scope: c,
        id: p,
        focusable: o,
        active: C,
        children: /* @__PURE__ */ m(
          G.span,
          {
            tabIndex: R ? 0 : -1,
            "data-orientation": u.orientation,
            ...y,
            ref: r,
            onMouseDown: b(e.onMouseDown, (t) => {
              o ? u.onItemFocus(p) : t.preventDefault();
            }),
            onFocus: b(e.onFocus, () => u.onItemFocus(p)),
            onKeyDown: b(e.onKeyDown, (t) => {
              if (t.key === "Tab" && t.shiftKey) {
                u.onItemShiftTab();
                return;
              }
              if (t.target !== t.currentTarget) return;
              const f = ue(t, u.orientation, u.dir);
              if (f !== void 0) {
                if (t.metaKey || t.ctrlKey || t.altKey || t.shiftKey) return;
                t.preventDefault();
                let i = E().filter((a) => a.focusable).map((a) => a.ref.current);
                if (f === "last") i.reverse();
                else if (f === "prev" || f === "next") {
                  f === "prev" && i.reverse();
                  const a = i.indexOf(t.currentTarget);
                  i = u.loop ? ae(i, a + 1) : i.slice(a + 1);
                }
                setTimeout(() => M(i));
              }
            }),
            children: typeof F == "function" ? F({ isCurrentTabStop: R, hasTabStop: T != null }) : F
          }
        )
      }
    );
  }
);
L.displayName = K;
var se = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function ce(e, r) {
  return r !== "rtl" ? e : e === "ArrowLeft" ? "ArrowRight" : e === "ArrowRight" ? "ArrowLeft" : e;
}
function ue(e, r, c) {
  const o = ce(e.key, c);
  if (!(r === "vertical" && ["ArrowLeft", "ArrowRight"].includes(o)) && !(r === "horizontal" && ["ArrowUp", "ArrowDown"].includes(o)))
    return se[o];
}
function M(e, r = !1) {
  const c = document.activeElement;
  for (const o of e)
    if (o === c || (o.focus({ preventScroll: r }), document.activeElement !== c)) return;
}
function ae(e, r) {
  return e.map((c, o) => e[(r + o) % e.length]);
}
var we = O, Ce = L;
export {
  Ce as Item,
  we as Root,
  O as RovingFocusGroup,
  L as RovingFocusGroupItem,
  Te as createRovingFocusGroupScope
};
//# sourceMappingURL=index212.js.map
