import { jsxs as o, jsx as n, Fragment as Z } from "react/jsx-runtime";
import * as l from "react";
import { Button as ee } from "./index65.js";
import { Popover as ne, PopoverTrigger as te, PopoverContent as re } from "./index32.js";
import { Command as oe, CommandInput as le, CommandList as se, CommandLoading as ie, CommandEmpty as ae, CommandGroup as B, CommandItem as E } from "./index128.js";
import { cn as g } from "./index145.js";
const be = ({
  options: s,
  onSearch: c,
  value: i,
  defaultValue: W,
  onValueChange: A,
  placeholder: _ = "Select…",
  searchPlaceholder: q = "Search…",
  emptyMessage: D = "No results.",
  debounceMs: v = 250,
  creatable: F,
  onCreate: C,
  createLabel: O = "Create",
  width: b = 240,
  maxDisplayed: T = 3,
  disabled: V,
  className: M,
  showClearAll: $ = !0
}) => {
  const u = typeof c == "function", [G, K] = l.useState(
    W ?? []
  ), k = i !== void 0, r = k ? i : G, [h, Q] = l.useState(!1), [f, w] = l.useState(""), [L, R] = l.useState([]), [H, N] = l.useState(!1), S = l.useRef(null), p = l.useRef(0);
  l.useEffect(() => {
    if (!u || !h) return;
    const e = ++p.current;
    S.current?.abort();
    const t = new AbortController();
    S.current = t;
    const a = setTimeout(async () => {
      N(!0);
      try {
        const x = await c(f);
        e === p.current && !t.signal.aborted && R(x);
      } catch {
        e === p.current && !t.signal.aborted && R([]);
      } finally {
        e === p.current && !t.signal.aborted && N(!1);
      }
    }, v);
    return () => {
      clearTimeout(a), t.abort();
    };
  }, [f, h, u, c, v]);
  const z = l.useMemo(
    () => u ? L : s ?? [],
    [u, L, s]
  ), y = l.useRef(/* @__PURE__ */ new Map());
  l.useEffect(() => {
    for (const e of z)
      y.current.set(e.value, e.label);
  }, [z]);
  const j = (e) => y.current.get(e) ?? e, m = (e) => {
    k || K(e);
    const t = e.map(
      (a) => z.find((x) => x.value === a) ?? {
        value: a,
        label: j(a)
      }
    );
    A?.(e, t);
  }, J = (e) => {
    r.includes(e) ? m(r.filter((t) => t !== e)) : m([...r, e]);
  }, U = (e) => m(r.filter((t) => t !== e)), d = f.trim(), X = z.some(
    (e) => e.label.trim().toLowerCase() === d.toLowerCase()
  ), Y = !!(F && C) && d.length > 0 && !X, I = r.slice(0, T), P = r.length - I.length;
  return /* @__PURE__ */ o(ne, { open: h, onOpenChange: Q, children: [
    /* @__PURE__ */ n(te, { asChild: !0, children: /* @__PURE__ */ n(
      ee,
      {
        variant: "outline",
        color: "neutral",
        role: "combobox",
        "aria-expanded": h,
        disabled: V,
        className: g(
          "zen-justify-between zen-font-normal zen-text-start zen-min-h-10 zen-h-auto zen-py-1.5",
          r.length === 0 && "zen-text-zen-muted-fg",
          M
        ),
        style: { minWidth: b },
        iconRight: /* @__PURE__ */ n(ue, {}),
        children: /* @__PURE__ */ n("span", { className: "zen-flex zen-flex-wrap zen-items-center zen-gap-1 zen-flex-1 zen-min-w-0", children: r.length === 0 ? _ : /* @__PURE__ */ o(Z, { children: [
          I.map((e) => /* @__PURE__ */ n(
            ce,
            {
              label: j(e),
              onRemove: (t) => {
                t.stopPropagation(), U(e);
              }
            },
            e
          )),
          P > 0 ? /* @__PURE__ */ o("span", { className: "zen-text-xs zen-text-zen-muted-fg zen-ml-0.5", children: [
            "+",
            P,
            " more"
          ] }) : null
        ] }) })
      }
    ) }),
    /* @__PURE__ */ n(
      re,
      {
        className: "zen-p-0",
        style: { width: typeof b == "number" ? b : void 0 },
        align: "start",
        children: /* @__PURE__ */ o(oe, { shouldFilter: !u, children: [
          /* @__PURE__ */ n(
            le,
            {
              value: f,
              onValueChange: w,
              placeholder: q
            }
          ),
          /* @__PURE__ */ o(se, { children: [
            u && H ? /* @__PURE__ */ n(ie, { children: "Searching…" }) : null,
            /* @__PURE__ */ n(ae, { children: D }),
            /* @__PURE__ */ n(B, { children: z.map((e) => {
              const t = r.includes(e.value);
              return /* @__PURE__ */ o(
                E,
                {
                  value: e.value,
                  keywords: [e.label, ...e.keywords ?? []],
                  disabled: e.disabled,
                  onSelect: (a) => {
                    e.disabled || J(a);
                  },
                  children: [
                    /* @__PURE__ */ n(
                      ze,
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
            Y ? /* @__PURE__ */ n(B, { children: /* @__PURE__ */ o(
              E,
              {
                value: `__create__${d}`,
                keywords: [d],
                onSelect: () => {
                  const e = C(d);
                  e && (y.current.set(e.value, e.label), r.includes(e.value) || m([...r, e.value])), w("");
                },
                children: [
                  /* @__PURE__ */ n(de, { style: { marginRight: 6 } }),
                  /* @__PURE__ */ o("span", { className: "zen-flex-1", children: [
                    O,
                    " “",
                    d,
                    "”"
                  ] })
                ]
              }
            ) }) : null
          ] }),
          $ && r.length > 0 ? /* @__PURE__ */ n("div", { className: "zen-border-t zen-border-zen-border zen-p-1", children: /* @__PURE__ */ o(
            "button",
            {
              type: "button",
              onClick: () => m([]),
              className: g(
                "zen-w-full zen-text-start zen-text-xs zen-px-2 zen-py-1 zen-rounded-zen-sm",
                "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
                "zen-bg-transparent zen-border-0 zen-cursor-pointer",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
              ),
              children: [
                "Clear all (",
                r.length,
                ")"
              ]
            }
          ) }) : null
        ] })
      }
    )
  ] });
}, ce = ({ label: s, onRemove: c }) => /* @__PURE__ */ o(
  "span",
  {
    className: g(
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
          onClick: c,
          onKeyDown: (i) => {
            (i.key === "Enter" || i.key === " ") && (i.preventDefault(), c(i));
          },
          onPointerDown: (i) => i.stopPropagation(),
          "aria-label": `Remove ${s}`,
          className: g(
            "zen-inline-flex zen-items-center zen-justify-center",
            "zen-h-3.5 zen-w-3.5 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
            "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
            "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring"
          ),
          children: /* @__PURE__ */ o(
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
), ue = () => /* @__PURE__ */ n(
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
), de = ({ style: s }) => /* @__PURE__ */ o("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, style: s, children: [
  /* @__PURE__ */ n("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
  /* @__PURE__ */ n("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
] }), ze = ({ style: s }) => /* @__PURE__ */ n(
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
  be as MultiCombobox
};
//# sourceMappingURL=index127.js.map
