import * as o from "react";
import { composeEventHandlers as T } from "./index191.js";
import { createContextScope as S } from "./index193.js";
import { useControllableState as D } from "./index202.js";
import { useLayoutEffect as L } from "./index208.js";
import { useComposedRefs as M } from "./index192.js";
import { Primitive as v } from "./index201.js";
import { Presence as k } from "./index200.js";
import { useId as F } from "./index197.js";
import { jsx as c } from "react/jsx-runtime";
var u = "Collapsible", [B, W] = S(u), [G, g] = B(u), w = o.forwardRef(
  (t, a) => {
    const {
      __scopeCollapsible: i,
      open: r,
      defaultOpen: e,
      disabled: l,
      onOpenChange: s,
      ...m
    } = t, [d, p] = D({
      prop: r,
      defaultProp: e ?? !1,
      onChange: s,
      caller: u
    });
    return /* @__PURE__ */ c(
      G,
      {
        scope: i,
        disabled: l,
        contentId: F(),
        open: d,
        onOpenToggle: o.useCallback(() => p((C) => !C), [p]),
        children: /* @__PURE__ */ c(
          v.div,
          {
            "data-state": h(d),
            "data-disabled": l ? "" : void 0,
            ...m,
            ref: a
          }
        )
      }
    );
  }
);
w.displayName = u;
var A = "CollapsibleTrigger", I = o.forwardRef(
  (t, a) => {
    const { __scopeCollapsible: i, ...r } = t, e = g(A, i);
    return /* @__PURE__ */ c(
      v.button,
      {
        type: "button",
        "aria-controls": e.open ? e.contentId : void 0,
        "aria-expanded": e.open || !1,
        "data-state": h(e.open),
        "data-disabled": e.disabled ? "" : void 0,
        disabled: e.disabled,
        ...r,
        ref: a,
        onClick: T(t.onClick, e.onOpenToggle)
      }
    );
  }
);
I.displayName = A;
var R = "CollapsibleContent", O = o.forwardRef(
  (t, a) => {
    const { forceMount: i, ...r } = t, e = g(R, t.__scopeCollapsible);
    return /* @__PURE__ */ c(k, { present: i || e.open, children: ({ present: l }) => /* @__PURE__ */ c($, { ...r, ref: a, present: l }) });
  }
);
O.displayName = R;
var $ = o.forwardRef((t, a) => {
  const { __scopeCollapsible: i, present: r, children: e, ...l } = t, s = g(R, i), [m, d] = o.useState(r), p = o.useRef(null), C = M(a, p), y = o.useRef(0), x = y.current, N = o.useRef(0), P = N.current, b = s.open || m, _ = o.useRef(b), f = o.useRef(void 0);
  return o.useEffect(() => {
    const n = requestAnimationFrame(() => _.current = !1);
    return () => cancelAnimationFrame(n);
  }, []), L(() => {
    const n = p.current;
    if (n) {
      f.current = f.current || {
        transitionDuration: n.style.transitionDuration,
        animationName: n.style.animationName
      }, n.style.transitionDuration = "0s", n.style.animationName = "none";
      const E = n.getBoundingClientRect();
      y.current = E.height, N.current = E.width, _.current || (n.style.transitionDuration = f.current.transitionDuration, n.style.animationName = f.current.animationName), d(r);
    }
  }, [s.open, r]), /* @__PURE__ */ c(
    v.div,
    {
      "data-state": h(s.open),
      "data-disabled": s.disabled ? "" : void 0,
      id: s.contentId,
      hidden: !b,
      ...l,
      ref: C,
      style: {
        "--radix-collapsible-content-height": x ? `${x}px` : void 0,
        "--radix-collapsible-content-width": P ? `${P}px` : void 0,
        ...t.style
      },
      children: b && e
    }
  );
});
function h(t) {
  return t ? "open" : "closed";
}
var X = w, Y = I, Z = O;
export {
  w as Collapsible,
  O as CollapsibleContent,
  I as CollapsibleTrigger,
  Z as Content,
  X as Root,
  Y as Trigger,
  W as createCollapsibleScope
};
//# sourceMappingURL=index175.js.map
