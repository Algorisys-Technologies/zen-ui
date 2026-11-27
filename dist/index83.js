import { jsxs as e, jsx as t } from "react/jsx-runtime";
import { ToastProvider as p, Toast as h, ToastTitle as m, ToastDescription as c, ToastClose as d, ToastViewport as u } from "./index82.js";
import { useToast as g } from "./index84.js";
const f = {
  "top-left": "zen-top-0 zen-left-0 zen-right-auto",
  "top-center": "zen-top-0 zen-left-1/2 zen-right-auto -zen-translate-x-1/2",
  "top-right": "zen-top-0 zen-right-0",
  "bottom-left": "zen-top-auto zen-bottom-0 zen-left-0 zen-right-auto",
  "bottom-center": "zen-top-auto zen-bottom-0 zen-left-1/2 zen-right-auto -zen-translate-x-1/2",
  "bottom-right": "zen-top-auto zen-bottom-0 zen-right-0"
}, T = () => /* @__PURE__ */ t(
  "svg",
  {
    "aria-hidden": "true",
    className: "zen-mt-0.5 zen-h-4 zen-w-4 zen-shrink-0 zen-animate-spin",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    children: /* @__PURE__ */ t("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
  }
), v = ({ position: r = "top-right" } = {}) => {
  const { toasts: i } = g();
  return /* @__PURE__ */ e(p, { children: [
    i.map(({ id: a, title: o, description: n, action: s, loading: l, ...z }) => /* @__PURE__ */ e(h, { ...z, children: [
      l ? /* @__PURE__ */ t(T, {}) : null,
      /* @__PURE__ */ e("div", { style: { display: "grid", gap: 4, flex: 1, minWidth: 0 }, children: [
        o ? /* @__PURE__ */ t(m, { children: o }) : null,
        n ? /* @__PURE__ */ t(c, { children: n }) : null
      ] }),
      s,
      /* @__PURE__ */ t(d, {})
    ] }, a)),
    /* @__PURE__ */ t(u, { className: f[r] })
  ] });
};
export {
  v as Toaster
};
//# sourceMappingURL=index83.js.map
