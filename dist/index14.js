import { jsxs as w, jsx as r } from "react/jsx-runtime";
import * as s from "react";
import { orderForLocale as N, formatDateInput as S, patternFor as T, parseDateInput as x, addMonths as Z, addDays as _ } from "./index167.js";
import { Popover as $, PopoverAnchor as ee, PopoverTrigger as te, PopoverContent as ne } from "./index35.js";
import { Calendar as re, focusableDay as oe } from "./index13.js";
import { useLocale as ae } from "./index90.js";
import { cn as se } from "./index160.js";
const le = (t, o) => !t && !o || !!t && !!o && t.getFullYear() === o.getFullYear() && t.getMonth() === o.getMonth() && t.getDate() === o.getDate(), he = ({
  value: t,
  defaultValue: o,
  onValueChange: R,
  onInvalidInput: E,
  locale: L,
  order: O,
  min: u,
  max: f,
  isDateDisabled: Y,
  placeholder: j,
  invalid: v,
  disabled: g,
  id: B,
  "aria-label": P,
  "aria-labelledby": U,
  width: W,
  className: q
}) => {
  const b = ae(), k = s.useId(), l = O ?? N(L), [G, H] = s.useState(o ?? null), n = t !== void 0 ? t : G, d = (e) => e ? S(e, l) : "", [p, z] = s.useState(() => d(n)), [I, i] = s.useState(!1), [J, Q] = s.useState(!1), C = s.useRef(!1), y = (e) => {
    C.current = e, Q(e);
  }, m = s.useRef(null), V = n ? n.getTime() : null, F = s.useRef(!0);
  s.useEffect(() => {
    if (F.current) {
      F.current = !1;
      return;
    }
    document.activeElement !== m.current && (z(n ? S(n, l) : ""), i(!1));
  }, [V, l]);
  const h = (e) => !(u && e < new Date(u.getFullYear(), u.getMonth(), u.getDate())) && !(f && e > new Date(f.getFullYear(), f.getMonth(), f.getDate())) && !Y?.(e), D = (e) => {
    i(!1), z(d(e)), !le(e, n) && (t === void 0 && H(e), R?.(e));
  }, A = () => {
    const e = p, a = x(e, l, /* @__PURE__ */ new Date());
    return a === "invalid" || a && !h(a) ? (i(!0), E?.(e), !1) : (D(a), !0);
  }, X = (e) => {
    if (e.key === "Enter") {
      A();
      return;
    }
    if (e.key === "Escape" && p !== d(n)) {
      e.preventDefault(), z(d(n)), i(!1);
      return;
    }
    if (e.key === "ArrowDown" && e.altKey) {
      e.preventDefault(), y(!0);
      return;
    }
    if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const a = x(p, l, /* @__PURE__ */ new Date()), c = a instanceof Date ? a : n ?? /* @__PURE__ */ new Date(), K = e.key === "ArrowUp" ? 1 : -1, M = e.shiftKey ? Z(c, K) : _(c, K);
      e.preventDefault(), h(M) && D(M);
    }
  };
  return /* @__PURE__ */ w($, { open: J, onOpenChange: y, children: [
    /* @__PURE__ */ w(
      ee,
      {
        className: se(
          "zen-inline-flex zen-h-zen-control zen-items-center zen-gap-1 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-px-zen-control-x",
          "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
          I || v ? "zen-border-zen-error" : "zen-border-zen-border",
          g && "zen-cursor-not-allowed zen-opacity-50",
          q
        ),
        style: { width: W ?? "var(--zen-date-input-width)" },
        children: [
          /* @__PURE__ */ r(
            "input",
            {
              ref: m,
              id: B,
              type: "text",
              inputMode: "text",
              autoComplete: "off",
              spellCheck: !1,
              value: p,
              placeholder: j ?? T(l),
              disabled: g,
              "aria-label": P,
              "aria-labelledby": U,
              "aria-describedby": k,
              "aria-invalid": I || v ? "true" : void 0,
              onChange: (e) => {
                z(e.currentTarget.value), i(!1);
              },
              onBlur: () => {
                C.current || A();
              },
              onKeyDown: X,
              className: "zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-sm zen-tabular-nums zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg"
            }
          ),
          /* @__PURE__ */ r("span", { id: k, className: "zen-sr-only", children: b.t("dateInput.hint", { pattern: T(l) }) }),
          /* @__PURE__ */ r(
            te,
            {
              type: "button",
              tabIndex: -1,
              disabled: g,
              "aria-label": b.t("dateInput.chooseDate"),
              className: "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0.5 zen-text-zen-muted-fg hover:zen-text-zen-foreground",
              children: /* @__PURE__ */ r(ie, {})
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ r(
      ne,
      {
        className: "zen-w-auto zen-p-0",
        align: "start",
        onOpenAutoFocus: (e) => {
          const a = e.currentTarget, c = oe(a);
          c && (e.preventDefault(), c.focus());
        },
        onCloseAutoFocus: (e) => {
          e.preventDefault(), m.current?.focus();
        },
        children: /* @__PURE__ */ r(
          re,
          {
            mode: "single",
            selected: n ?? void 0,
            defaultMonth: n ?? void 0,
            onSelect: (e) => {
              e && h(e) && D(e), y(!1);
            },
            disabled: (e) => !h(e)
          }
        )
      }
    )
  ] });
}, ge = (t, o = N()) => x(t, o, /* @__PURE__ */ new Date()) instanceof Date, ie = () => /* @__PURE__ */ w("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [
  /* @__PURE__ */ r("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
  /* @__PURE__ */ r("line", { x1: "16", y1: "2", x2: "16", y2: "6" }),
  /* @__PURE__ */ r("line", { x1: "8", y1: "2", x2: "8", y2: "6" }),
  /* @__PURE__ */ r("line", { x1: "3", y1: "10", x2: "21", y2: "10" })
] });
export {
  he as DateInput,
  ge as isTypedDate
};
//# sourceMappingURL=index14.js.map
