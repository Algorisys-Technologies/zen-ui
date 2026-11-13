import { jsxs as d, jsx as s } from "react/jsx-runtime";
import * as i from "react";
import { shiftAt as A, shiftWindow as f, nextShift as B, previousShift as E } from "./index136.js";
import { useLocale as L } from "./index90.js";
import { Icon as h } from "./index63.js";
import { cn as p } from "./index197.js";
const m = p(
  "zen-inline-flex zen-h-zen-control zen-aspect-square zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-cursor-pointer",
  "hover:zen-bg-zen-muted disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2"
), M = i.forwardRef(
  ({ shifts: t, timeZone: r, value: g, defaultValue: v, onChange: w, allowFuture: N, now: y, className: k, ...S }, C) => {
    const o = L(), [I, D] = i.useState(() => Date.now());
    i.useEffect(() => {
      const e = setInterval(() => D(Date.now()), 6e4);
      return () => clearInterval(e);
    }, []);
    const c = +(y ?? I), a = i.useMemo(() => A(c, t, r, { orNext: !0 }), [c, t, r]), [T, j] = i.useState(v), n = g ?? T ?? a ?? void 0, l = n ? f(n, t, r) : null, x = !!n && !!a && n.id === a.id && n.day === a.day, z = (e) => {
      if (!e) return;
      const b = f(e, t, r);
      b && (j(e), w?.(e, b));
    }, u = n ? B(n, t) : null, R = (() => {
      if (N) return !1;
      const e = u ? f(u, t, r) : null;
      return !e || e.start > c;
    })(), F = t.find((e) => e.id === n?.id)?.label ?? o.t("shifts.named", { name: n?.id ?? "" }), $ = l ? new Intl.DateTimeFormat(o.locale, { weekday: "short", day: "numeric", month: "short", timeZone: r }).format(l.start) : "", q = (() => {
      if (!l) return "";
      const e = new Intl.DateTimeFormat(o.locale, { hour: "2-digit", minute: "2-digit", timeZone: r });
      return `${e.format(l.start)}–${e.format(l.end)}`;
    })();
    return /* @__PURE__ */ d(
      "div",
      {
        ref: C,
        role: "group",
        "aria-label": o.t("shifts.label"),
        className: p("zen-flex zen-flex-wrap zen-items-center zen-gap-2", k),
        ...S,
        children: [
          /* @__PURE__ */ s(
            "button",
            {
              type: "button",
              className: m,
              "aria-label": o.t("shifts.previous"),
              onClick: () => z(n ? E(n, t) : null),
              children: /* @__PURE__ */ s(h, { name: "chevron-left", size: 18, className: "rtl:zen-rotate-180" })
            }
          ),
          /* @__PURE__ */ d("div", { className: "zen-flex zen-min-w-0 zen-flex-col zen-px-1", "aria-live": "polite", children: [
            /* @__PURE__ */ d("span", { className: "zen-flex zen-items-center zen-gap-2 zen-text-base zen-font-semibold zen-text-zen-foreground", children: [
              F,
              " · ",
              $,
              x && /* @__PURE__ */ s("span", { className: "zen-rounded-zen-full zen-bg-zen-success-soft zen-px-2 zen-py-px zen-text-xs zen-font-medium zen-text-zen-success-soft-fg", children: o.t("shifts.now") })
            ] }),
            /* @__PURE__ */ s("span", { className: "zen-text-sm zen-tabular-nums zen-text-zen-muted-fg", children: q })
          ] }),
          /* @__PURE__ */ s(
            "button",
            {
              type: "button",
              className: m,
              "aria-label": o.t("shifts.next"),
              disabled: R,
              onClick: () => z(u),
              children: /* @__PURE__ */ s(h, { name: "chevron-right", size: 18, className: "rtl:zen-rotate-180" })
            }
          ),
          !x && /* @__PURE__ */ s(
            "button",
            {
              type: "button",
              className: p(m, "zen-aspect-auto zen-px-zen-control-x zen-text-sm zen-font-medium"),
              onClick: () => z(a),
              children: o.t("shifts.current")
            }
          )
        ]
      }
    );
  }
);
M.displayName = "ShiftNavigator";
export {
  M as ShiftNavigator
};
//# sourceMappingURL=index135.js.map
