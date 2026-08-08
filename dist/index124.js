import { jsxs as o, jsx as t } from "react/jsx-runtime";
import * as n from "react";
import { Button as J } from "./index64.js";
import { Popover as K, PopoverTrigger as U, PopoverContent as X } from "./index31.js";
import { Command as Y, CommandInput as Z, CommandList as ee, CommandLoading as te, CommandEmpty as ne, CommandGroup as z, CommandItem as B } from "./index126.js";
import { cn as re } from "./index143.js";
const he = ({
  options: l,
  onSearch: p,
  value: v,
  defaultValue: A,
  onValueChange: P,
  placeholder: _ = "Select…",
  searchPlaceholder: q = "Search…",
  emptyMessage: E = "No results.",
  debounceMs: C = 250,
  creatable: N,
  onCreate: x,
  createLabel: T = "Create",
  width: y = 240,
  disabled: V,
  className: W
}) => {
  const s = typeof p == "function", [F, G] = n.useState(A ?? ""), k = v !== void 0, i = k ? v : F, [d, g] = n.useState(!1), [h, w] = n.useState(""), [L, R] = n.useState([]), [M, S] = n.useState(!1), j = n.useRef(null), m = n.useRef(0);
  n.useEffect(() => {
    if (!s || !d) return;
    const e = ++m.current;
    j.current?.abort();
    const r = new AbortController();
    j.current = r;
    const u = setTimeout(async () => {
      S(!0);
      try {
        const b = await p(h);
        e === m.current && !r.signal.aborted && R(b);
      } catch {
        e === m.current && !r.signal.aborted && R([]);
      } finally {
        e === m.current && !r.signal.aborted && S(!1);
      }
    }, C);
    return () => {
      clearTimeout(u), r.abort();
    };
  }, [h, d, s, p, C]);
  const c = n.useMemo(
    () => s ? L : l ?? [],
    [s, L, l]
  ), I = n.useMemo(
    () => c.find((e) => e.value === i) ?? null,
    [c, i]
  ), f = n.useRef("");
  I && (f.current = I.label);
  const Q = i && f.current ? f.current : _, O = (e, r) => {
    k || G(e), P?.(e, r);
  }, a = h.trim(), $ = c.some(
    (e) => e.label.trim().toLowerCase() === a.toLowerCase()
  ), D = !!(N && x) && a.length > 0 && !$;
  return /* @__PURE__ */ o(K, { open: d, onOpenChange: g, children: [
    /* @__PURE__ */ t(U, { asChild: !0, children: /* @__PURE__ */ t(
      J,
      {
        variant: "outline",
        color: "neutral",
        role: "combobox",
        "aria-expanded": d,
        disabled: V,
        className: re(
          "zen-justify-between zen-font-normal",
          !i && "zen-text-zen-muted-fg",
          W
        ),
        style: { width: y },
        iconRight: /* @__PURE__ */ t(oe, {}),
        children: /* @__PURE__ */ t("span", { style: { overflow: "hidden", textOverflow: "ellipsis" }, children: Q })
      }
    ) }),
    /* @__PURE__ */ t(
      X,
      {
        className: "zen-p-0",
        style: { width: typeof y == "number" ? y : void 0 },
        align: "start",
        children: /* @__PURE__ */ o(
          Y,
          {
            shouldFilter: !s,
            children: [
              /* @__PURE__ */ t(
                Z,
                {
                  value: h,
                  onValueChange: w,
                  placeholder: q
                }
              ),
              /* @__PURE__ */ o(ee, { children: [
                s && M ? /* @__PURE__ */ t(te, { children: "Searching…" }) : null,
                /* @__PURE__ */ t(ne, { children: E }),
                /* @__PURE__ */ t(z, { children: c.map((e) => /* @__PURE__ */ o(
                  B,
                  {
                    value: e.value,
                    keywords: [e.label, ...e.keywords ?? []],
                    disabled: e.disabled,
                    onSelect: (r) => {
                      if (e.disabled) return;
                      const u = r === i ? "" : r, b = u === "" ? null : c.find((H) => H.value === u) ?? null;
                      O(u, b), g(!1);
                    },
                    children: [
                      /* @__PURE__ */ t(
                        se,
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
                D ? /* @__PURE__ */ t(z, { children: /* @__PURE__ */ o(
                  B,
                  {
                    value: `__create__${a}`,
                    keywords: [a],
                    onSelect: () => {
                      const e = x(a);
                      e && (f.current = e.label, O(e.value, e)), w(""), g(!1);
                    },
                    children: [
                      /* @__PURE__ */ t(le, { style: { marginRight: 6 } }),
                      /* @__PURE__ */ o("span", { style: { flex: 1 }, children: [
                        T,
                        " “",
                        a,
                        "”"
                      ] })
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
}, oe = () => /* @__PURE__ */ t("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ t("polyline", { points: "6 9 12 15 18 9" }) }), le = ({ style: l }) => /* @__PURE__ */ o("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, style: l, children: [
  /* @__PURE__ */ t("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
  /* @__PURE__ */ t("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
] }), se = ({ style: l }) => /* @__PURE__ */ t("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, style: l, children: /* @__PURE__ */ t("polyline", { points: "20 6 9 17 4 12" }) });
export {
  he as Combobox
};
//# sourceMappingURL=index124.js.map
