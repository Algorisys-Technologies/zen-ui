import { jsxs as u, jsx as t } from "react/jsx-runtime";
import * as o from "react";
import { Button as oe } from "./index71.js";
import { Popover as re, PopoverTrigger as le, PopoverContent as se } from "./index35.js";
import { Command as ae, CommandInput as ie, CommandList as ce, CommandLoading as de, CommandEmpty as ue, CommandGroup as S, CommandItem as q } from "./index141.js";
import { useLocale as me } from "./index90.js";
import { cn as he } from "./index160.js";
const Le = ({
  options: s,
  onSearch: y,
  value: C,
  defaultValue: A,
  onValueChange: M,
  placeholder: _,
  searchPlaceholder: E,
  emptyMessage: T,
  debounceMs: w = 250,
  creatable: V,
  onCreate: L,
  createLabel: W,
  width: g = 240,
  disabled: $,
  invalid: N,
  id: F,
  "aria-label": G,
  className: Q
}) => {
  const a = me(), D = _ ?? a.t("combobox.placeholder"), H = E ?? a.t("combobox.searchPlaceholder"), J = T ?? a.t("combobox.noResults"), K = W ?? a.t("combobox.create"), r = typeof y == "function", [U, X] = o.useState(A ?? ""), k = C !== void 0, i = k ? C : U, [h, v] = o.useState(!1), [c, R] = o.useState(""), [O, j] = o.useState([]), [f, z] = o.useState(!1), P = o.useRef(null), p = o.useRef(0);
  o.useEffect(() => {
    if (!r || !h) return;
    const e = ++p.current;
    P.current?.abort();
    const n = new AbortController();
    P.current = n, z(!0);
    const m = setTimeout(async () => {
      try {
        const x = await y(c);
        e === p.current && !n.signal.aborted && j(x);
      } catch {
        e === p.current && !n.signal.aborted && j([]);
      } finally {
        e === p.current && !n.signal.aborted && z(!1);
      }
    }, w);
    return () => {
      clearTimeout(m), n.abort();
    };
  }, [c, h, r, y, w]);
  const l = o.useMemo(
    () => r ? O : s ?? [],
    [r, O, s]
  ), Y = o.useMemo(() => {
    if (!r || !f) return l;
    const e = c.trim().toLowerCase();
    return e ? l.filter(
      (n) => `${n.label} ${(n.keywords ?? []).join(" ")}`.toLowerCase().includes(e)
    ) : l;
  }, [r, f, l, c]), I = o.useMemo(
    () => l.find((e) => e.value === i) ?? null,
    [l, i]
  ), b = o.useRef("");
  I && (b.current = I.label);
  const Z = i && b.current ? b.current : D, B = (e, n) => {
    k || X(e), M?.(e, n);
  }, d = c.trim(), ee = l.some(
    (e) => e.label.trim().toLowerCase() === d.toLowerCase()
  ), te = !!(V && L) && d.length > 0 && !ee;
  return /* @__PURE__ */ u(re, { open: h, onOpenChange: v, children: [
    /* @__PURE__ */ t(le, { asChild: !0, children: /* @__PURE__ */ t(
      oe,
      {
        variant: "outline",
        color: "neutral",
        role: "combobox",
        "aria-expanded": h,
        id: F,
        "aria-label": G,
        "aria-invalid": N ? "true" : void 0,
        disabled: $,
        className: he(
          "zen-justify-between zen-font-normal",
          "aria-[invalid=true]:zen-border-zen-error",
          !i && "zen-text-zen-muted-fg",
          Q
        ),
        style: { width: g },
        iconRight: /* @__PURE__ */ t(fe, {}),
        children: /* @__PURE__ */ t("span", { style: { overflow: "hidden", textOverflow: "ellipsis" }, children: Z })
      }
    ) }),
    /* @__PURE__ */ t(
      se,
      {
        className: "zen-p-0",
        style: { width: typeof g == "number" ? g : void 0 },
        align: "start",
        children: /* @__PURE__ */ u(
          ae,
          {
            shouldFilter: !r,
            children: [
              /* @__PURE__ */ t(
                ie,
                {
                  value: c,
                  onValueChange: R,
                  placeholder: H
                }
              ),
              /* @__PURE__ */ u(ce, { children: [
                r && f ? /* @__PURE__ */ t(de, { children: a.t("combobox.searching") }) : null,
                r && f ? null : /* @__PURE__ */ t(ue, { children: J }),
                /* @__PURE__ */ t(S, { children: Y.map((e) => /* @__PURE__ */ u(
                  q,
                  {
                    value: e.value,
                    keywords: [e.label, ...e.keywords ?? []],
                    disabled: e.disabled,
                    onSelect: (n) => {
                      if (e.disabled) return;
                      const m = n === i ? "" : n, x = m === "" ? null : l.find((ne) => ne.value === m) ?? null;
                      B(m, x), v(!1);
                    },
                    children: [
                      /* @__PURE__ */ t(
                        be,
                        {
                          style: {
                            opacity: i === e.value ? 1 : 0,
                            marginRight: 6
                          }
                        }
                      ),
                      /* @__PURE__ */ t("span", { style: { flex: 1 }, children: e.content ?? e.label })
                    ]
                  },
                  e.value
                )) }),
                te ? /* @__PURE__ */ t(S, { children: /* @__PURE__ */ u(
                  q,
                  {
                    value: `__create__${d}`,
                    keywords: [d],
                    onSelect: () => {
                      const e = L(d);
                      e && (b.current = e.label, B(e.value, e)), R(""), v(!1);
                    },
                    children: [
                      /* @__PURE__ */ t(pe, { style: { marginRight: 6 } }),
                      /* @__PURE__ */ t("span", { style: { flex: 1 }, children: a.t("combobox.createOption", { verb: K, text: d }) })
                    ]
                  }
                ) }) : null
              ] })
            ]
          }
        )
      }
    )
  ] });
}, fe = () => /* @__PURE__ */ t("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ t("polyline", { points: "6 9 12 15 18 9" }) }), pe = ({ style: s }) => /* @__PURE__ */ u("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, style: s, children: [
  /* @__PURE__ */ t("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
  /* @__PURE__ */ t("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
] }), be = ({ style: s }) => /* @__PURE__ */ t("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, style: s, children: /* @__PURE__ */ t("polyline", { points: "20 6 9 17 4 12" }) });
export {
  Le as Combobox
};
//# sourceMappingURL=index137.js.map
