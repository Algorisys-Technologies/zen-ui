import * as i from "react";
import { createContextScope as S } from "./index195.js";
import { useComposedRefs as D } from "./index192.js";
import { Dialog as M, Close as A, DialogPortal as w, DialogTrigger as I, createDialogScope as v, Content as x, Description as L, DialogOverlay as h, DialogTitle as F } from "./index168.js";
import { composeEventHandlers as G } from "./index194.js";
import { jsx as l } from "react/jsx-runtime";
var f = "AlertDialog", [j] = S(f, [
  v
]), n = v(), d = (e) => {
  const { __scopeAlertDialog: r, ...o } = e, a = n(r);
  return /* @__PURE__ */ l(M, { ...a, ...o, modal: !0 });
};
d.displayName = f;
var H = "AlertDialogTrigger", u = i.forwardRef(
  (e, r) => {
    const { __scopeAlertDialog: o, ...a } = e, t = n(o);
    return /* @__PURE__ */ l(I, { ...t, ...a, ref: r });
  }
);
u.displayName = H;
var V = "AlertDialogPortal", _ = (e) => {
  const { __scopeAlertDialog: r, ...o } = e, a = n(r);
  return /* @__PURE__ */ l(w, { ...a, ...o });
};
_.displayName = V;
var Y = "AlertDialogOverlay", m = i.forwardRef(
  (e, r) => {
    const { __scopeAlertDialog: o, ...a } = e, t = n(o);
    return /* @__PURE__ */ l(h, { ...t, ...a, ref: r });
  }
);
m.displayName = Y;
var N = "AlertDialogContent", [b, k] = j(N), R = i.forwardRef(
  (e, r) => {
    const { __scopeAlertDialog: o, children: a, ...t } = e, c = n(o), p = i.useRef(null), y = D(r, p), g = i.useRef(null);
    return /* @__PURE__ */ l(b, { scope: o, cancelRef: g, children: /* @__PURE__ */ l(
      x,
      {
        role: "alertdialog",
        ...c,
        ...t,
        ref: y,
        onOpenAutoFocus: G(t.onOpenAutoFocus, (s) => {
          s.preventDefault(), g.current?.focus({ preventScroll: !0 });
        }),
        onPointerDownOutside: (s) => s.preventDefault(),
        onInteractOutside: (s) => s.preventDefault(),
        children: a
      }
    ) });
  }
);
R.displayName = N;
var q = "AlertDialogTitle", C = i.forwardRef(
  (e, r) => {
    const { __scopeAlertDialog: o, ...a } = e, t = n(o);
    return /* @__PURE__ */ l(F, { ...t, ...a, ref: r });
  }
);
C.displayName = q;
var z = "AlertDialogDescription", T = i.forwardRef((e, r) => {
  const { __scopeAlertDialog: o, ...a } = e, t = n(o);
  return /* @__PURE__ */ l(L, { ...t, ...a, ref: r });
});
T.displayName = z;
var B = "AlertDialogAction", P = i.forwardRef(
  (e, r) => {
    const { __scopeAlertDialog: o, ...a } = e, t = n(o);
    return /* @__PURE__ */ l(A, { ...t, ...a, ref: r });
  }
);
P.displayName = B;
var E = "AlertDialogCancel", O = i.forwardRef(
  (e, r) => {
    const { __scopeAlertDialog: o, ...a } = e, { cancelRef: t } = k(E, o), c = n(o), p = D(r, t);
    return /* @__PURE__ */ l(A, { ...c, ...a, ref: p });
  }
);
O.displayName = E;
var X = d, Z = u, $ = _, oo = m, eo = R, ro = P, ao = O, to = C, lo = T;
export {
  ro as Action,
  d as AlertDialog,
  P as AlertDialogAction,
  O as AlertDialogCancel,
  R as AlertDialogContent,
  T as AlertDialogDescription,
  m as AlertDialogOverlay,
  _ as AlertDialogPortal,
  C as AlertDialogTitle,
  u as AlertDialogTrigger,
  ao as Cancel,
  eo as Content,
  lo as Description,
  oo as Overlay,
  $ as Portal,
  X as Root,
  to as Title,
  Z as Trigger
};
//# sourceMappingURL=index169.js.map
