import { jsxs as r, jsx as o } from "react/jsx-runtime";
import "react";
import { ToastProvider as n, Toast as d, ToastTitle as m, ToastDescription as p, ToastClose as T, ToastViewport as c } from "./index74.js";
import { useToast as h } from "./index76.js";
const j = () => {
  const { toasts: i } = h();
  return /* @__PURE__ */ r(n, { children: [
    i.map(({ id: e, title: t, description: s, action: l, ...a }) => /* @__PURE__ */ r(d, { ...a, children: [
      /* @__PURE__ */ r("div", { style: { display: "grid", gap: 4, flex: 1, minWidth: 0 }, children: [
        t ? /* @__PURE__ */ o(m, { children: t }) : null,
        s ? /* @__PURE__ */ o(p, { children: s }) : null
      ] }),
      l,
      /* @__PURE__ */ o(T, {})
    ] }, e)),
    /* @__PURE__ */ o(c, {})
  ] });
};
export {
  j as Toaster
};
//# sourceMappingURL=index75.js.map
