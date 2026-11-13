import { jsxs as l, jsx as n, Fragment as ie } from "react/jsx-runtime";
import * as r from "react";
import { Button as ae } from "./index71.js";
import { Popover as ce, PopoverTrigger as ue, PopoverContent as de } from "./index35.js";
import { Command as me, CommandInput as he, CommandList as ze, CommandLoading as fe, CommandEmpty as pe, CommandGroup as O, CommandItem as W } from "./index178.js";
import { useLocale as q } from "./index90.js";
import { cn as y } from "./index197.js";
const Ne = ({
  options: s,
  onSearch: d,
  value: p,
  defaultValue: c,
  onValueChange: A,
  placeholder: _,
  searchPlaceholder: D,
  emptyMessage: F,
  debounceMs: k = 250,
  creatable: T,
  onCreate: L,
  createLabel: V,
  width: v = 240,
  maxDisplayed: $ = 3,
  disabled: G,
  "aria-label": K,
  className: Q,
  showClearAll: H = !0
}) => {
  const m = q(), J = _ ?? m.t("combobox.placeholder"), U = D ?? m.t("combobox.searchPlaceholder"), X = F ?? m.t("combobox.noResults"), Y = V ?? m.t("combobox.create"), i = typeof d == "function", [Z, ee] = r.useState(
    c ?? []
  ), R = p !== void 0, o = R ? p : Z, [b, ne] = r.useState(!1), [h, N] = r.useState(""), [P, j] = r.useState([]), [g, I] = r.useState(!1), B = r.useRef(null), x = r.useRef(0);
  r.useEffect(() => {
    if (!i || !b) return;
    const e = ++x.current;
    B.current?.abort();
    const t = new AbortController();
    B.current = t, I(!0);
    const u = setTimeout(async () => {
      try {
        const w = await d(h);
        e === x.current && !t.signal.aborted && j(w);
      } catch {
        e === x.current && !t.signal.aborted && j([]);
      } finally {
        e === x.current && !t.signal.aborted && I(!1);
      }
    }, k);
    return () => {
      clearTimeout(u), t.abort();
    };
  }, [h, b, i, d, k]);
  const a = r.useMemo(
    () => i ? P : s ?? [],
    [i, P, s]
  ), te = r.useMemo(() => {
    if (!i || !g) return a;
    const e = h.trim().toLowerCase();
    return e ? a.filter(
      (t) => `${t.label} ${(t.keywords ?? []).join(" ")}`.toLowerCase().includes(e)
    ) : a;
  }, [i, g, a, h]), C = r.useRef(/* @__PURE__ */ new Map());
  r.useEffect(() => {
    for (const e of a)
      C.current.set(e.value, e.label);
  }, [a]);
  const S = (e) => a.find((t) => t.value === e)?.label ?? C.current.get(e) ?? e, f = (e) => {
    R || ee(e);
    const t = e.map(
      (u) => a.find((w) => w.value === u) ?? {
        value: u,
        label: S(u)
      }
    );
    A?.(e, t);
  }, oe = (e) => {
    o.includes(e) ? f(o.filter((t) => t !== e)) : f([...o, e]);
  }, re = (e) => f(o.filter((t) => t !== e)), z = h.trim(), le = a.some(
    (e) => e.label.trim().toLowerCase() === z.toLowerCase()
  ), se = !!(T && L) && z.length > 0 && !le, E = o.slice(0, $), M = o.length - E.length;
  return /* @__PURE__ */ l(ce, { open: b, onOpenChange: ne, children: [
    /* @__PURE__ */ n(ue, { asChild: !0, children: /* @__PURE__ */ n(
      ae,
      {
        variant: "outline",
        color: "neutral",
        role: "combobox",
        "aria-expanded": b,
        "aria-label": K,
        disabled: G,
        className: y(
          "zen-justify-between zen-font-normal zen-text-start zen-min-h-10 zen-h-auto zen-py-1.5",
          o.length === 0 && "zen-text-zen-muted-fg",
          Q
        ),
        style: { minWidth: v },
        iconRight: /* @__PURE__ */ n(ge, {}),
        children: /* @__PURE__ */ n("span", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-1 zen-flex-1 zen-min-w-0", children: o.length === 0 ? J : /* @__PURE__ */ l(ie, { children: [
          E.map((e) => /* @__PURE__ */ n(
            be,
            {
              label: S(e),
              onRemove: (t) => {
                t.stopPropagation(), re(e);
              }
            },
            e
          )),
          M > 0 ? /* @__PURE__ */ l("span", { className: "zen-text-xs zen-text-zen-muted-fg zen-ml-0.5", children: [
            "+",
            M,
            " more"
          ] }) : null
        ] }) })
      }
    ) }),
    /* @__PURE__ */ n(
      de,
      {
        className: "zen-p-0",
        style: { width: typeof v == "number" ? v : void 0 },
        align: "start",
        children: /* @__PURE__ */ l(me, { shouldFilter: !i, children: [
          /* @__PURE__ */ n(
            he,
            {
              value: h,
              onValueChange: N,
              placeholder: U
            }
          ),
          /* @__PURE__ */ l(ze, { children: [
            i && g ? /* @__PURE__ */ n(fe, { children: m.t("combobox.searching") }) : null,
            i && g ? null : /* @__PURE__ */ n(pe, { children: X }),
            /* @__PURE__ */ n(O, { children: te.map((e) => {
              const t = o.includes(e.value);
              return /* @__PURE__ */ l(
                W,
                {
                  value: e.value,
                  keywords: [e.label, ...e.keywords ?? []],
                  disabled: e.disabled,
                  onSelect: (u) => {
                    e.disabled || oe(u);
                  },
                  children: [
                    /* @__PURE__ */ n(
                      ye,
                      {
                        style: {
                          opacity: t ? 1 : 0,
                          marginRight: 6
                        }
                      }
                    ),
                    /* @__PURE__ */ n("span", { className: "zen-flex-1", children: e.content ?? e.label })
                  ]
                },
                e.value
              );
            }) }),
            se ? /* @__PURE__ */ n(O, { children: /* @__PURE__ */ l(
              W,
              {
                value: `__create__${z}`,
                keywords: [z],
                onSelect: () => {
                  const e = L(z);
                  e && (C.current.set(e.value, e.label), o.includes(e.value) || f([...o, e.value])), N("");
                },
                children: [
                  /* @__PURE__ */ n(xe, { style: { marginRight: 6 } }),
                  /* @__PURE__ */ n("span", { className: "zen-flex-1", children: m.t("combobox.createOption", { verb: Y, text: z }) })
                ]
              }
            ) }) : null
          ] }),
          H && o.length > 0 ? /* @__PURE__ */ n("div", { className: "zen-border-t zen-border-zen-border zen-p-1", children: /* @__PURE__ */ l(
            "button",
            {
              type: "button",
              onClick: () => f([]),
              className: y(
                "zen-w-full zen-text-start zen-text-xs zen-px-2 zen-py-1 zen-rounded-zen-sm",
                "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
                "zen-bg-transparent zen-border-0 zen-cursor-pointer",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
              ),
              children: [
                "Clear all (",
                o.length,
                ")"
              ]
            }
          ) }) : null
        ] })
      }
    )
  ] });
}, be = ({ label: s, onRemove: d }) => {
  const p = q();
  return /* @__PURE__ */ l(
    "span",
    {
      className: y(
        "zen-inline-flex zen-items-center zen-gap-1 zen-px-1.5 zen-py-0.5",
        "zen-text-xs zen-font-medium",
        "zen-rounded-zen-sm zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
        "zen-max-w-[10rem]"
      ),
      children: [
        /* @__PURE__ */ n("span", { className: "zen-truncate", children: s }),
        /* @__PURE__ */ n(
          "span",
          {
            role: "button",
            tabIndex: 0,
            onClick: d,
            onKeyDown: (c) => {
              (c.key === "Enter" || c.key === " ") && (c.preventDefault(), d(c));
            },
            onPointerDown: (c) => c.stopPropagation(),
            "aria-label": p.t("combobox.remove", { label: s }),
            className: y(
              "zen-inline-flex zen-items-center zen-justify-center",
              "zen-h-3.5 zen-w-3.5 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
              "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
              "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring"
            ),
            children: /* @__PURE__ */ l(
              "svg",
              {
                width: "9",
                height: "9",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "3",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                "aria-hidden": !0,
                children: [
                  /* @__PURE__ */ n("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                  /* @__PURE__ */ n("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
                ]
              }
            )
          }
        )
      ]
    }
  );
}, ge = () => /* @__PURE__ */ n(
  "svg",
  {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": !0,
    children: /* @__PURE__ */ n("polyline", { points: "6 9 12 15 18 9" })
  }
), xe = ({ style: s }) => /* @__PURE__ */ l("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, style: s, children: [
  /* @__PURE__ */ n("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
  /* @__PURE__ */ n("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
] }), ye = ({ style: s }) => /* @__PURE__ */ n(
  "svg",
  {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": !0,
    style: s,
    children: /* @__PURE__ */ n("polyline", { points: "20 6 9 17 4 12" })
  }
);
export {
  Ne as MultiCombobox
};
//# sourceMappingURL=index177.js.map
