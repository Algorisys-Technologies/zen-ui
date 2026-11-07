import { jsxs as d, jsx as s } from "react/jsx-runtime";
import * as m from "react";
import { cva as h } from "./index161.js";
import { formatAmount as k, formatNumber as T } from "./index162.js";
import { useLocale as p } from "./index90.js";
import { Icon as N } from "./index63.js";
import { cn as i } from "./index160.js";
const j = {
  none: "zen-text-zen-foreground",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning-text",
  error: "zen-text-zen-error",
  info: "zen-text-zen-info"
}, M = {
  success: "check-circle",
  warning: "warn",
  error: "error",
  info: "info"
}, O = h(
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
), E = {
  none: "zen-bg-zen-neutral-soft zen-text-zen-neutral-soft-fg",
  success: "zen-bg-zen-success-soft zen-text-zen-success-soft-fg",
  warning: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg",
  error: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg",
  info: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg"
}, R = {
  none: "zen-text-zen-muted-fg",
  success: "zen-text-zen-success-soft-fg",
  warning: "zen-text-zen-warning-soft-fg",
  error: "zen-text-zen-error-soft-fg",
  info: "zen-text-zen-info-soft-fg"
}, y = m.forwardRef(
  ({ state: n = "none", icon: e, inverted: t, stateAnnouncement: o, stamp: r, className: z, children: c, ...a }, l) => {
    const f = e === null || r && e === void 0 ? null : e ?? (n === "none" ? null : M[n]);
    return /* @__PURE__ */ d(
      "span",
      {
        ref: l,
        className: i(
          O({ inverted: t }),
          r ? i(
            "zen-rounded-zen-sm zen-border zen-border-solid zen-border-current zen-px-1.5 zen-py-px",
            "zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wider",
            R[n]
          ) : t ? E[n] : j[n],
          z
        ),
        ...a,
        children: [
          f ? /* @__PURE__ */ s(N, { name: f, size: 14 }) : null,
          c,
          o ? /* @__PURE__ */ s("span", { className: "zen-sr-only", children: o }) : null
        ]
      }
    );
  }
);
y.displayName = "ObjectStatus";
const S = m.forwardRef(
  ({ value: n, number: e, currency: t, precision: o, locale: r, unit: z, state: c = "none", emphasized: a = !1, className: l, ...f }, w) => {
    const v = p(), x = n === void 0 && e !== void 0;
    let g = n;
    if (x) {
      const b = r ?? v.locale;
      g = t ? k(e, t, { locale: b, display: "none", precision: o }) : T(e, { locale: b, precision: o });
    }
    const u = z ?? (x ? t : void 0);
    return /* @__PURE__ */ d(
      "span",
      {
        ref: w,
        className: i(
          "zen-inline-flex zen-items-baseline zen-gap-1 zen-tabular-nums",
          a ? "zen-text-lg zen-font-semibold" : "zen-text-sm zen-font-medium",
          j[c],
          l
        ),
        ...f,
        children: [
          /* @__PURE__ */ s("span", { children: g }),
          u ? /* @__PURE__ */ s("span", { className: "zen-text-xs zen-font-normal zen-opacity-80", children: u }) : null
        ]
      }
    );
  }
);
S.displayName = "ObjectNumber";
const A = m.forwardRef(
  ({ title: n, text: e, className: t, ...o }, r) => /* @__PURE__ */ d("div", { ref: r, className: i("zen-flex zen-flex-col zen-gap-0.5", t), ...o, children: [
    /* @__PURE__ */ s("span", { className: "zen-text-sm zen-font-semibold zen-text-zen-foreground", children: n }),
    e ? /* @__PURE__ */ s("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: e }) : null
  ] })
);
A.displayName = "ObjectIdentifier";
const I = {
  flagged: { icon: "flag", label: "objectMarker.flagged" },
  favorite: { icon: "star", label: "objectMarker.favorite" },
  draft: { icon: "draft", label: "objectMarker.draft" },
  locked: { icon: "lock", label: "objectMarker.locked" },
  unsaved: { icon: "edit", label: "objectMarker.unsaved" }
}, _ = m.forwardRef(
  ({ type: n, showLabel: e = !1, label: t, className: o, ...r }, z) => {
    const c = p(), a = I[n], l = t ?? c.t(a.label);
    return /* @__PURE__ */ d(
      "span",
      {
        ref: z,
        className: i(
          "zen-inline-flex zen-items-center zen-gap-1 zen-text-xs zen-text-zen-muted-fg",
          o
        ),
        ...r,
        children: [
          /* @__PURE__ */ s(N, { name: a.icon, size: 12, title: e ? void 0 : l }),
          e ? /* @__PURE__ */ s("span", { children: l }) : null
        ]
      }
    );
  }
);
_.displayName = "ObjectMarker";
export {
  A as ObjectIdentifier,
  _ as ObjectMarker,
  S as ObjectNumber,
  y as ObjectStatus,
  O as objectStatusVariants
};
//# sourceMappingURL=index62.js.map
