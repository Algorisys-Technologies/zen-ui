import { template as i, spread as u, mergeProps as f, insert as r, createComponent as c, memo as v } from "solid-js/web";
import { splitProps as g, Show as z } from "solid-js";
import { cva as b } from "./index118.js";
import { Icon as p } from "./index21.js";
import { cn as m } from "./index106.js";
var h = /* @__PURE__ */ i("<span class=zen-sr-only>"), d = /* @__PURE__ */ i("<span>"), _ = /* @__PURE__ */ i('<span class="zen-text-xs zen-font-normal zen-opacity-80">'), w = /* @__PURE__ */ i("<span><span>"), $ = /* @__PURE__ */ i('<span class="zen-text-xs zen-text-zen-muted-fg">'), T = /* @__PURE__ */ i('<div><span class="zen-text-sm zen-font-semibold zen-text-zen-foreground">');
const x = {
  none: "zen-text-zen-foreground",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error",
  info: "zen-text-zen-info"
}, A = {
  success: "check-circle",
  warning: "warn",
  error: "error",
  info: "info"
}, E = b(
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
        true: "zen-rounded-zen-sm zen-px-2 zen-py-0.5 zen-font-medium",
        false: ""
      }
    },
    defaultVariants: {
      inverted: !1
    }
  }
), k = {
  none: "zen-bg-zen-neutral-soft zen-text-zen-neutral-soft-fg",
  success: "zen-bg-zen-success-soft zen-text-zen-success-soft-fg",
  warning: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg",
  error: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg",
  info: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg"
}, L = (l) => {
  const [e, a] = g(l, ["state", "icon", "inverted", "stateAnnouncement", "class", "children"]), n = () => e.state ?? "none", s = () => e.icon === null ? null : e.icon ?? (n() === "none" ? null : A[n()]);
  return (() => {
    var t = d();
    return u(t, f({
      get class() {
        return m(E({
          inverted: e.inverted
        }), e.inverted ? k[n()] : x[n()], e.class);
      }
    }, a), !1, !0), r(t, c(z, {
      get when() {
        return s();
      },
      children: (o) => c(p, {
        get name() {
          return o();
        },
        size: 14
      })
    }), null), r(t, () => e.children, null), r(t, c(z, {
      get when() {
        return e.stateAnnouncement;
      },
      get children() {
        var o = h();
        return r(o, () => e.stateAnnouncement), o;
      }
    }), null), t;
  })();
}, N = (l) => {
  const [e, a] = g(l, ["value", "unit", "state", "emphasized", "class"]);
  return (() => {
    var n = w(), s = n.firstChild;
    return u(n, f({
      get class() {
        return m("zen-inline-flex zen-items-baseline zen-gap-1 zen-tabular-nums", e.emphasized ? "zen-text-lg zen-font-semibold" : "zen-text-sm zen-font-medium", x[e.state ?? "none"], e.class);
      }
    }, a), !1, !0), r(s, () => e.value), r(n, c(z, {
      get when() {
        return e.unit;
      },
      get children() {
        var t = _();
        return r(t, () => e.unit), t;
      }
    }), null), n;
  })();
}, R = (l) => {
  const [e, a] = g(l, ["title", "text", "class"]);
  return (() => {
    var n = T(), s = n.firstChild;
    return u(n, f({
      get class() {
        return m("zen-flex zen-flex-col zen-gap-0.5", e.class);
      }
    }, a), !1, !0), r(s, () => e.title), r(n, c(z, {
      get when() {
        return e.text;
      },
      get children() {
        var t = $();
        return r(t, () => e.text), t;
      }
    }), null), n;
  })();
}, S = {
  flagged: {
    icon: "flag",
    label: "Flagged"
  },
  favorite: {
    icon: "star",
    label: "Favorite"
  },
  draft: {
    icon: "draft",
    label: "Draft"
  },
  locked: {
    icon: "lock",
    label: "Locked"
  },
  unsaved: {
    icon: "edit",
    label: "Unsaved changes"
  }
}, V = (l) => {
  const [e, a] = g(l, ["type", "showLabel", "label", "class"]), n = () => S[e.type], s = () => e.label ?? n().label;
  return (() => {
    var t = d();
    return u(t, f({
      get class() {
        return m("zen-inline-flex zen-items-center zen-gap-1 zen-text-xs zen-text-zen-muted-fg", e.class);
      }
    }, a), !1, !0), r(t, c(p, {
      get name() {
        return n().icon;
      },
      size: 12,
      get title() {
        return v(() => !!e.showLabel)() ? void 0 : s();
      }
    }), null), r(t, c(z, {
      get when() {
        return e.showLabel;
      },
      get children() {
        var o = d();
        return r(o, s), o;
      }
    }), null), t;
  })();
};
export {
  R as ObjectIdentifier,
  V as ObjectMarker,
  N as ObjectNumber,
  L as ObjectStatus,
  E as objectStatusVariants
};
//# sourceMappingURL=index20.js.map
