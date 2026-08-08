import * as s from "react";
import { createContextScope as Q } from "./index195.js";
import { createCollection as W } from "./index209.js";
import { useComposedRefs as X } from "./index192.js";
import { composeEventHandlers as Z } from "./index194.js";
import { useControllableState as O } from "./index204.js";
import { Primitive as T } from "./index203.js";
import { Content as $, Root as ee, Trigger as oe, createCollapsibleScope as M } from "./index173.js";
import { useId as re } from "./index199.js";
import { useDirection as te } from "./index171.js";
import { jsx as n } from "react/jsx-runtime";
var d = "Accordion", ne = ["Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"], [E, ce, ie] = W(d), [b] = Q(d, [
  ie,
  M
]), S = M(), V = s.forwardRef(
  (o, c) => {
    const { type: e, ...t } = o, i = t, r = t;
    return /* @__PURE__ */ n(E.Provider, { scope: o.__scopeAccordion, children: e === "multiple" ? /* @__PURE__ */ n(de, { ...r, ref: c }) : /* @__PURE__ */ n(se, { ...i, ref: c }) });
  }
);
V.displayName = d;
var [H, ae] = b(d), [K, le] = b(
  d,
  { collapsible: !1 }
), se = s.forwardRef(
  (o, c) => {
    const {
      value: e,
      defaultValue: t,
      onValueChange: i = () => {
      },
      collapsible: r = !1,
      ...l
    } = o, [a, p] = O({
      prop: e,
      defaultProp: t ?? "",
      onChange: i,
      caller: d
    });
    return /* @__PURE__ */ n(
      H,
      {
        scope: o.__scopeAccordion,
        value: s.useMemo(() => a ? [a] : [], [a]),
        onItemOpen: p,
        onItemClose: s.useCallback(() => r && p(""), [r, p]),
        children: /* @__PURE__ */ n(K, { scope: o.__scopeAccordion, collapsible: r, children: /* @__PURE__ */ n(L, { ...l, ref: c }) })
      }
    );
  }
), de = s.forwardRef((o, c) => {
  const {
    value: e,
    defaultValue: t,
    onValueChange: i = () => {
    },
    ...r
  } = o, [l, a] = O({
    prop: e,
    defaultProp: t ?? [],
    onChange: i,
    caller: d
  }), p = s.useCallback(
    (v) => a((m = []) => [...m, v]),
    [a]
  ), u = s.useCallback(
    (v) => a((m = []) => m.filter((h) => h !== v)),
    [a]
  );
  return /* @__PURE__ */ n(
    H,
    {
      scope: o.__scopeAccordion,
      value: l,
      onItemOpen: p,
      onItemClose: u,
      children: /* @__PURE__ */ n(K, { scope: o.__scopeAccordion, collapsible: !0, children: /* @__PURE__ */ n(L, { ...r, ref: c }) })
    }
  );
}), [pe, I] = b(d), L = s.forwardRef(
  (o, c) => {
    const { __scopeAccordion: e, disabled: t, dir: i, orientation: r = "vertical", ...l } = o, a = s.useRef(null), p = X(a, c), u = ce(e), m = te(i) === "ltr", h = Z(o.onKeyDown, (C) => {
      if (!ne.includes(C.key)) return;
      const F = C.target, x = u().filter((N) => !N.ref.current?.disabled), A = x.findIndex((N) => N.ref.current === F), D = x.length;
      if (A === -1) return;
      C.preventDefault();
      let f = A;
      const _ = 0, w = D - 1, R = () => {
        f = A + 1, f > w && (f = _);
      }, P = () => {
        f = A - 1, f < _ && (f = w);
      };
      switch (C.key) {
        case "Home":
          f = _;
          break;
        case "End":
          f = w;
          break;
        case "ArrowRight":
          r === "horizontal" && (m ? R() : P());
          break;
        case "ArrowDown":
          r === "vertical" && R();
          break;
        case "ArrowLeft":
          r === "horizontal" && (m ? P() : R());
          break;
        case "ArrowUp":
          r === "vertical" && P();
          break;
      }
      const J = f % D;
      x[J].ref.current?.focus();
    });
    return /* @__PURE__ */ n(
      pe,
      {
        scope: e,
        disabled: t,
        direction: i,
        orientation: r,
        children: /* @__PURE__ */ n(E.Slot, { scope: e, children: /* @__PURE__ */ n(
          T.div,
          {
            ...l,
            "data-orientation": r,
            ref: p,
            onKeyDown: t ? void 0 : h
          }
        ) })
      }
    );
  }
), g = "AccordionItem", [fe, k] = b(g), z = s.forwardRef(
  (o, c) => {
    const { __scopeAccordion: e, value: t, ...i } = o, r = I(g, e), l = ae(g, e), a = S(e), p = re(), u = t && l.value.includes(t) || !1, v = r.disabled || o.disabled;
    return /* @__PURE__ */ n(
      fe,
      {
        scope: e,
        open: u,
        disabled: v,
        triggerId: p,
        children: /* @__PURE__ */ n(
          ee,
          {
            "data-orientation": r.orientation,
            "data-state": B(u),
            ...a,
            ...i,
            ref: c,
            disabled: v,
            open: u,
            onOpenChange: (m) => {
              m ? l.onItemOpen(t) : l.onItemClose(t);
            }
          }
        )
      }
    );
  }
);
z.displayName = g;
var G = "AccordionHeader", U = s.forwardRef(
  (o, c) => {
    const { __scopeAccordion: e, ...t } = o, i = I(d, e), r = k(G, e);
    return /* @__PURE__ */ n(
      T.h3,
      {
        "data-orientation": i.orientation,
        "data-state": B(r.open),
        "data-disabled": r.disabled ? "" : void 0,
        ...t,
        ref: c
      }
    );
  }
);
U.displayName = G;
var y = "AccordionTrigger", j = s.forwardRef(
  (o, c) => {
    const { __scopeAccordion: e, ...t } = o, i = I(d, e), r = k(y, e), l = le(y, e), a = S(e);
    return /* @__PURE__ */ n(E.ItemSlot, { scope: e, children: /* @__PURE__ */ n(
      oe,
      {
        "aria-disabled": r.open && !l.collapsible || void 0,
        "data-orientation": i.orientation,
        id: r.triggerId,
        ...a,
        ...t,
        ref: c
      }
    ) });
  }
);
j.displayName = y;
var Y = "AccordionContent", q = s.forwardRef(
  (o, c) => {
    const { __scopeAccordion: e, ...t } = o, i = I(d, e), r = k(Y, e), l = S(e);
    return /* @__PURE__ */ n(
      $,
      {
        role: "region",
        "aria-labelledby": r.triggerId,
        "data-orientation": i.orientation,
        ...l,
        ...t,
        ref: c,
        style: {
          "--radix-accordion-content-height": "var(--radix-collapsible-content-height)",
          "--radix-accordion-content-width": "var(--radix-collapsible-content-width)",
          ...o.style
        }
      }
    );
  }
);
q.displayName = Y;
function B(o) {
  return o ? "open" : "closed";
}
var _e = V, we = z, Re = U, Pe = j, Ne = q;
export {
  V as Accordion,
  q as AccordionContent,
  U as AccordionHeader,
  z as AccordionItem,
  j as AccordionTrigger,
  Ne as Content,
  Re as Header,
  we as Item,
  _e as Root,
  Pe as Trigger
};
//# sourceMappingURL=index172.js.map
