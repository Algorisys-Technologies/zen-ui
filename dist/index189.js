import { jsxs as e, jsx as n } from "react/jsx-runtime";
import "react";
import { useDroppable as f } from "./index242.js";
import { Icon as x } from "./index63.js";
import { useLocale as b } from "./index90.js";
import { cn as o } from "./index197.js";
const u = ({
  id: r,
  title: z,
  icon: t,
  hideTitle: s,
  className: i,
  horizontal: l,
  children: m,
  isEmpty: a
}) => {
  const c = b(), { setNodeRef: d, isOver: p } = f({ id: r, data: { zone: r } });
  return /* @__PURE__ */ e(
    "div",
    {
      ref: d,
      className: o(
        "zen-min-h-5 zen-min-w-5 zen-border zen-border-zen-border zen-bg-zen-muted/30 zen-p-2 zen-align-top zen-transition-colors",
        i,
        p && "zen-border zen-border-dashed zen-border-zen-primary/40 zen-bg-zen-muted"
      ),
      children: [
        s ? null : /* @__PURE__ */ n("div", { className: "zen-mb-1.5 zen-flex zen-items-center zen-justify-between", children: /* @__PURE__ */ e("div", { className: "zen-flex zen-select-none zen-items-center zen-gap-2 zen-text-sm zen-font-semibold zen-text-zen-foreground", children: [
          t ? /* @__PURE__ */ n(x, { name: t, className: "zen-h-4 zen-w-4" }) : null,
          z
        ] }) }),
        /* @__PURE__ */ e(
          "div",
          {
            className: o(
              "zen-flex zen-min-h-0 zen-min-w-0 zen-flex-1 zen-content-start zen-gap-1.5",
              l ? "zen-flex-row zen-flex-wrap zen-items-center" : "zen-flex-col zen-items-stretch"
            ),
            children: [
              m,
              a ? /* @__PURE__ */ n("div", { className: "zen-pointer-events-none zen-select-none zen-py-0.5 zen-text-xs zen-italic zen-text-zen-muted-fg/50", children: c.t("pivot.dropHere") }) : null
            ]
          }
        )
      ]
    }
  );
};
u.displayName = "PivotDropZone";
export {
  u as PivotDropZone
};
//# sourceMappingURL=index189.js.map
