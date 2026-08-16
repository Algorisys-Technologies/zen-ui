import * as f from "react";
import { composeEventHandlers as g } from "./index191.js";
import { createContextScope as x } from "./index193.js";
import { Root as E, Item as F, createRovingFocusGroupScope as C } from "./index213.js";
import { Presence as w } from "./index200.js";
import { Primitive as b } from "./index201.js";
import { useDirection as D } from "./index173.js";
import { useControllableState as V } from "./index202.js";
import { useId as G } from "./index197.js";
import { jsx as u } from "react/jsx-runtime";
var p = "Tabs", [L] = x(p, [
  C
]), h = C(), [$, T] = L(p), I = f.forwardRef(
  (e, n) => {
    const {
      __scopeTabs: s,
      value: t,
      onValueChange: r,
      defaultValue: c,
      orientation: o = "horizontal",
      dir: d,
      activationMode: v = "automatic",
      ...m
    } = e, i = D(d), [a, l] = V({
      prop: t,
      onChange: r,
      defaultProp: c ?? "",
      caller: p
    });
    return /* @__PURE__ */ u(
      $,
      {
        scope: s,
        baseId: G(),
        value: a,
        onValueChange: l,
        orientation: o,
        dir: i,
        activationMode: v,
        children: /* @__PURE__ */ u(
          b.div,
          {
            dir: i,
            "data-orientation": o,
            ...m,
            ref: n
          }
        )
      }
    );
  }
);
I.displayName = p;
var R = "TabsList", _ = f.forwardRef(
  (e, n) => {
    const { __scopeTabs: s, loop: t = !0, ...r } = e, c = T(R, s), o = h(s);
    return /* @__PURE__ */ u(
      E,
      {
        asChild: !0,
        ...o,
        orientation: c.orientation,
        dir: c.dir,
        loop: t,
        children: /* @__PURE__ */ u(
          b.div,
          {
            role: "tablist",
            "aria-orientation": c.orientation,
            ...r,
            ref: n
          }
        )
      }
    );
  }
);
_.displayName = R;
var y = "TabsTrigger", A = f.forwardRef(
  (e, n) => {
    const { __scopeTabs: s, value: t, disabled: r = !1, ...c } = e, o = T(y, s), d = h(s), v = P(o.baseId, t), m = S(o.baseId, t), i = t === o.value;
    return /* @__PURE__ */ u(
      F,
      {
        asChild: !0,
        ...d,
        focusable: !r,
        active: i,
        children: /* @__PURE__ */ u(
          b.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": i,
            "aria-controls": m,
            "data-state": i ? "active" : "inactive",
            "data-disabled": r ? "" : void 0,
            disabled: r,
            id: v,
            ...c,
            ref: n,
            onMouseDown: g(e.onMouseDown, (a) => {
              !r && a.button === 0 && a.ctrlKey === !1 ? o.onValueChange(t) : a.preventDefault();
            }),
            onKeyDown: g(e.onKeyDown, (a) => {
              r || a.target !== a.currentTarget || [" ", "Enter"].includes(a.key) && o.onValueChange(t);
            }),
            onFocus: g(e.onFocus, () => {
              const a = o.activationMode !== "manual";
              !i && !r && a && o.onValueChange(t);
            })
          }
        )
      }
    );
  }
);
A.displayName = y;
var M = "TabsContent", N = f.forwardRef(
  (e, n) => {
    const { __scopeTabs: s, value: t, forceMount: r, children: c, ...o } = e, d = T(M, s), v = P(d.baseId, t), m = S(d.baseId, t), i = t === d.value, a = f.useRef(i);
    return f.useEffect(() => {
      const l = requestAnimationFrame(() => a.current = !1);
      return () => cancelAnimationFrame(l);
    }, []), /* @__PURE__ */ u(w, { present: r || i, children: ({ present: l }) => /* @__PURE__ */ u(
      b.div,
      {
        "data-state": i ? "active" : "inactive",
        "data-orientation": d.orientation,
        role: "tabpanel",
        "aria-labelledby": v,
        hidden: !l,
        id: m,
        tabIndex: 0,
        ...o,
        ref: n,
        style: {
          ...e.style,
          animationDuration: a.current ? "0s" : void 0
        },
        children: l && c
      }
    ) });
  }
);
N.displayName = M;
function P(e, n) {
  return `${e}-trigger-${n}`;
}
function S(e, n) {
  return `${e}-content-${n}`;
}
var Q = I, U = _, W = A, X = N;
export {
  X as Content,
  U as List,
  Q as Root,
  I as Tabs,
  N as TabsContent,
  _ as TabsList,
  A as TabsTrigger,
  W as Trigger
};
//# sourceMappingURL=index176.js.map
