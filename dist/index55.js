import { jsxs as z, jsx as r } from "react/jsx-runtime";
import * as i from "react";
import { cva as g } from "./index144.js";
import { Icon as m } from "./index56.js";
import { cn as f } from "./index143.js";
const u = {
  none: "zen-text-zen-foreground",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error",
  info: "zen-text-zen-info"
}, x = {
  success: "check-circle",
  warning: "warn",
  error: "error",
  info: "info"
}, p = g(
  // `relative` is load-bearing, not cosmetic: `stateAnnouncement` renders an
  // `sr-only` span, which is `position: absolute`. Without a positioned
  // ancestor its containing block is the initial containing block, so it
  // escapes any scroll container it sits in and contributes its offset to the
  // document's scrollable overflow. Inside ObjectPageLayout's scroller that
  // grew the page to 3343px and let the whole app shell scroll away.
  "zen-relative zen-inline-flex zen-items-center zen-gap-1 zen-text-sm zen-leading-snug",
  {
    variants: {
      inverted: {
        // The "inverted" status: filled pill rather than coloured text.
        true: "zen-rounded-zen-sm zen-px-2 zen-py-0.5 zen-font-medium",
        false: ""
      }
    },
    defaultVariants: { inverted: !1 }
  }
), b = {
  none: "zen-bg-zen-neutral-soft zen-text-zen-neutral-soft-fg",
  success: "zen-bg-zen-success-soft zen-text-zen-success-soft-fg",
  warning: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg",
  error: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg",
  info: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg"
}, N = i.forwardRef(
  ({ state: n = "none", icon: e, inverted: t, stateAnnouncement: s, className: a, children: l, ...o }, c) => {
    const d = e === null ? null : e ?? (n === "none" ? null : x[n]);
    return /* @__PURE__ */ z(
      "span",
      {
        ref: c,
        className: f(
          p({ inverted: t }),
          t ? b[n] : u[n],
          a
        ),
        ...o,
        children: [
          d ? /* @__PURE__ */ r(m, { name: d, size: 14 }) : null,
          l,
          s ? /* @__PURE__ */ r("span", { className: "zen-sr-only", children: s }) : null
        ]
      }
    );
  }
);
N.displayName = "ObjectStatus";
const h = i.forwardRef(
  ({ value: n, unit: e, state: t = "none", emphasized: s = !1, className: a, ...l }, o) => /* @__PURE__ */ z(
    "span",
    {
      ref: o,
      className: f(
        "zen-inline-flex zen-items-baseline zen-gap-1 zen-tabular-nums",
        s ? "zen-text-lg zen-font-semibold" : "zen-text-sm zen-font-medium",
        u[t],
        a
      ),
      ...l,
      children: [
        /* @__PURE__ */ r("span", { children: n }),
        e ? /* @__PURE__ */ r("span", { className: "zen-text-xs zen-font-normal zen-opacity-80", children: e }) : null
      ]
    }
  )
);
h.displayName = "ObjectNumber";
const j = i.forwardRef(
  ({ title: n, text: e, className: t, ...s }, a) => /* @__PURE__ */ z("div", { ref: a, className: f("zen-flex zen-flex-col zen-gap-0.5", t), ...s, children: [
    /* @__PURE__ */ r("span", { className: "zen-text-sm zen-font-semibold zen-text-zen-foreground", children: n }),
    e ? /* @__PURE__ */ r("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: e }) : null
  ] })
);
j.displayName = "ObjectIdentifier";
const v = {
  flagged: { icon: "flag", label: "Flagged" },
  favorite: { icon: "star", label: "Favorite" },
  draft: { icon: "draft", label: "Draft" },
  locked: { icon: "lock", label: "Locked" },
  unsaved: { icon: "edit", label: "Unsaved changes" }
}, w = i.forwardRef(
  ({ type: n, showLabel: e = !1, label: t, className: s, ...a }, l) => {
    const o = v[n], c = t ?? o.label;
    return /* @__PURE__ */ z(
      "span",
      {
        ref: l,
        className: f(
          "zen-inline-flex zen-items-center zen-gap-1 zen-text-xs zen-text-zen-muted-fg",
          s
        ),
        ...a,
        children: [
          /* @__PURE__ */ r(m, { name: o.icon, size: 12, title: e ? void 0 : c }),
          e ? /* @__PURE__ */ r("span", { children: c }) : null
        ]
      }
    );
  }
);
w.displayName = "ObjectMarker";
export {
  j as ObjectIdentifier,
  w as ObjectMarker,
  h as ObjectNumber,
  N as ObjectStatus,
  p as objectStatusVariants
};
//# sourceMappingURL=index55.js.map
