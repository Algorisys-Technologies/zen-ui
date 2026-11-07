import { jsxs as H, jsx as c } from "react/jsx-runtime";
import * as r from "react";
import { createPortal as Ce } from "react-dom";
import { filterLookup as Ne, queryWords as Re, highlightRanges as Fe } from "./index221.js";
import { useAnchoredPlacement as Me } from "./index220.js";
import { Icon as ae } from "./index63.js";
import { useLocale as Ee } from "./index90.js";
import { cn as b } from "./index160.js";
const S = (u, v) => {
  if (u.value) return u.value(v);
  const h = v[u.key];
  return h == null ? "" : String(h);
}, le = 10;
function Pe({
  columns: u,
  rows: v,
  onSearch: h,
  minQueryLength: ie,
  debounce: B,
  rowKey: m,
  rowLabel: U,
  value: I,
  defaultValue: ce,
  onValueChange: ue,
  onValueHelp: k,
  maxRows: de,
  placeholder: G,
  emptyMessage: fe,
  invalid: O,
  disabled: g,
  id: ze,
  "aria-label": Q,
  "aria-labelledby": me,
  width: pe,
  listWidth: he,
  className: ge
}) {
  const f = Ee(), w = r.useId(), J = `${w}-status`, X = (e) => `${w}-r${e}`, A = r.useRef(null), Y = r.useRef(null), D = r.useRef(null), [be, ve] = r.useState(ce ?? null), z = I !== void 0 ? I : be, xe = (e) => e ? U ? U(e) : S(u[0], e) : "", [t, T] = r.useState(!1), [s, L] = r.useState(""), [d, q] = r.useState(!1), [a, x] = r.useState(0), ye = d ? s : xe(z), [Z, _] = r.useState(null), [V, C] = r.useState(!1), [ke, K] = r.useState(!1), N = ie ?? 1, y = !!h, ee = y && s.trim().length < N, ne = r.useRef(h);
  ne.current = h, r.useEffect(() => {
    if (!t || !y) return;
    if (s.trim().length < N) {
      _(null), C(!1);
      return;
    }
    const e = new AbortController();
    C(!0), K(!1);
    const n = setTimeout(() => {
      ne.current(s, e.signal).then(
        (o) => {
          e.signal.aborted || (_({ rows: o, for: s }), C(!1));
        },
        () => {
          e.signal.aborted || (K(!0), C(!1));
        }
      );
    }, B ?? 200);
    return () => {
      clearTimeout(n), e.abort();
    };
  }, [t, s, y, N, B]);
  const $ = de ?? 50, i = r.useMemo(() => y ? (Z?.rows ?? []).slice(0, $) : Ne(v ?? [], (n) => u.filter((o) => o.searchable !== !1).map((o) => S(o, n)), d ? s : "", $), [y, Z, $, u, v, d, s]), te = r.useMemo(() => d ? Re(s) : [], [d, s]), R = Me({ anchor: A, popup: D, open: t, maxHeight: 320 }), j = () => {
    if (g || t) return;
    T(!0);
    const e = z && !d ? i.findIndex((n) => m(n) === m(z)) : -1;
    x(e >= 0 ? e : 0);
  }, P = () => T(!1), F = () => {
    P(), q(!1), L("");
  }, M = (e) => {
    const n = e === null ? z !== null : !z || m(z) !== m(e);
    I === void 0 && ve(e), F(), n && ue?.(e);
  };
  r.useEffect(() => {
    a > i.length - 1 && x(Math.max(0, i.length - 1));
  }, [i.length, a]);
  const W = r.useRef(!1);
  r.useLayoutEffect(() => {
    const e = D.current;
    if (!t || !e) return;
    if (W.current) {
      W.current = !1;
      return;
    }
    const n = e.querySelector(`[data-index="${a}"]`), o = e.querySelector("[data-lookup-head]");
    if (!n) return;
    const l = n.offsetTop - (o?.offsetHeight ?? 0), p = n.offsetTop + n.offsetHeight;
    l < e.scrollTop ? e.scrollTop = l : p > e.scrollTop + e.clientHeight && (e.scrollTop = p - e.clientHeight);
  }, [t, a, i, R.style]), r.useEffect(() => {
    if (!t) return;
    const e = (n) => {
      const o = n.target;
      !A.current?.contains(o) && !D.current?.contains(o) && (T(!1), q(!1), L(""));
    };
    return document.addEventListener("pointerdown", e, !0), () => document.removeEventListener("pointerdown", e, !0);
  }, [t]);
  const E = (e) => {
    const n = i.length;
    n !== 0 && x(Math.max(0, Math.min(n - 1, e)));
  }, re = () => {
    const e = d ? s : "";
    F(), k?.(e);
  }, we = (e) => {
    if (!g) {
      if (e.key === "F4" && k) {
        e.preventDefault(), re();
        return;
      }
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault(), t ? e.altKey || E(a + 1) : j();
          return;
        case "ArrowUp":
          e.preventDefault(), t && E(a - 1);
          return;
        case "PageDown":
          if (!t) return;
          e.preventDefault(), E(a + le);
          return;
        case "PageUp":
          if (!t) return;
          e.preventDefault(), E(a - le);
          return;
        case "Enter": {
          if (!t || e.nativeEvent.isComposing) return;
          e.preventDefault();
          const n = i[a];
          n && M(n);
          return;
        }
        case "Tab": {
          const n = t && d && s.trim() ? i[a] : void 0;
          n && M(n);
          return;
        }
        case "Escape":
          (t || d) && (e.preventDefault(), t && d && s ? P() : F());
          return;
      }
    }
  }, De = (e) => {
    if (!te.length) return e;
    const n = Fe(e, te);
    if (!n.length) return e;
    const o = [];
    let l = 0;
    for (const [p, se] of n)
      p > l && o.push(e.slice(l, p)), o.push(
        /* @__PURE__ */ c("mark", { className: "zen-bg-transparent zen-font-semibold zen-text-inherit", children: e.slice(p, se) }, p)
      ), l = se;
    return l < e.length && o.push(e.slice(l)), o;
  }, Te = u.map((e) => e.width ?? "minmax(0,1fr)").join(" "), oe = t ? ee ? f.t("lookupField.typeMore", { count: N }) : V ? f.t("lookupField.searching") : ke ? f.t("lookupField.failed") : i.length === 0 ? fe ?? f.t("lookupField.noMatches") : f.t("lookupField.results", { count: i.length }) : "";
  return /* @__PURE__ */ H("div", { ref: A, className: b("zen-relative", ge), style: { width: pe ?? "100%" }, children: [
    /* @__PURE__ */ H(
      "div",
      {
        className: b(
          "zen-flex zen-h-zen-control zen-items-center zen-gap-1 zen-rounded-zen-md zen-border zen-border-solid zen-bg-zen-background zen-px-zen-control-x",
          "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
          O ? "zen-border-zen-error" : "zen-border-zen-border",
          g && "zen-cursor-not-allowed zen-opacity-50"
        ),
        children: [
          /* @__PURE__ */ c(
            "input",
            {
              ref: Y,
              id: ze,
              type: "text",
              role: "combobox",
              autoComplete: "off",
              spellCheck: !1,
              "aria-autocomplete": "list",
              "aria-expanded": t,
              "aria-controls": t ? w : void 0,
              "aria-activedescendant": t && i[a] ? X(a) : void 0,
              "aria-describedby": J,
              "aria-label": Q,
              "aria-labelledby": me,
              "aria-invalid": O ? "true" : void 0,
              "aria-keyshortcuts": k ? "F4" : void 0,
              disabled: g,
              placeholder: G,
              value: ye,
              onChange: (e) => {
                L(e.currentTarget.value), q(!0), x(0), t || T(!0);
              },
              onClick: () => j(),
              onBlur: () => {
                d && s.trim() === "" ? M(null) : F();
              },
              onKeyDown: we,
              className: "zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-sm zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg"
            }
          ),
          k ? /* @__PURE__ */ c(
            "button",
            {
              type: "button",
              tabIndex: -1,
              "aria-label": f.t("lookupField.searchAll"),
              title: f.t("lookupField.searchAll"),
              disabled: g,
              onMouseDown: (e) => e.preventDefault(),
              onClick: re,
              className: "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0.5 zen-text-zen-muted-fg hover:zen-text-zen-foreground",
              children: /* @__PURE__ */ c(ae, { name: "search", size: 16 })
            }
          ) : null,
          /* @__PURE__ */ c(
            "button",
            {
              type: "button",
              tabIndex: -1,
              "aria-label": t ? f.t("common.close") : f.t("common.open"),
              disabled: g,
              onMouseDown: (e) => e.preventDefault(),
              onClick: () => {
                t ? P() : (j(), Y.current?.focus());
              },
              className: "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0.5 zen-text-zen-muted-fg hover:zen-text-zen-foreground",
              children: /* @__PURE__ */ c(ae, { name: t ? "chevron-up" : "chevron-down", size: 16 })
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ c("span", { id: J, className: "zen-sr-only", "aria-live": "polite", children: oe }),
    t && Ce(
      /* @__PURE__ */ H(
        "div",
        {
          ref: D,
          id: w,
          role: "listbox",
          "aria-label": Q ?? G,
          dir: R.dir,
          onMouseDown: (e) => e.preventDefault(),
          style: {
            ...R.style,
            display: "grid",
            gridTemplateColumns: Te,
            alignContent: "start",
            width: he ?? "max-content",
            minWidth: `max(${R.style.minWidth ?? "0px"}, var(--zen-lookup-list-width))`,
            maxWidth: "min(var(--zen-lookup-list-max-width), calc(100vw - 16px))"
            // the placement keeps 8px off each edge
          },
          className: "zen-z-50 zen-gap-x-3 zen-overflow-y-auto zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-text-sm zen-shadow-md",
          children: [
            /* @__PURE__ */ c(
              "div",
              {
                "data-lookup-head": "",
                "aria-hidden": "true",
                className: "zen-sticky zen-top-0 zen-z-10 zen-col-span-full zen-grid zen-border-0 zen-border-b zen-border-solid zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-py-1.5 zen-text-xs zen-font-medium zen-text-zen-muted-fg",
                style: { gridTemplateColumns: "subgrid" },
                children: u.map((e) => /* @__PURE__ */ c("div", { className: b("zen-truncate", e.align === "end" && "zen-text-end"), children: e.header }, e.key))
              }
            ),
            i.length > 0 && !ee ? /* @__PURE__ */ c(
              "div",
              {
                className: b("zen-col-span-full zen-grid zen-py-1", V && "zen-opacity-60"),
                style: { gridTemplateColumns: "subgrid" },
                children: i.map((e, n) => {
                  const o = !!z && m(z) === m(e);
                  return /* @__PURE__ */ c(
                    "div",
                    {
                      id: X(n),
                      role: "option",
                      "data-index": n,
                      "aria-selected": o,
                      "aria-label": u.map((l) => S(l, e)).filter(Boolean).join(", "),
                      onPointerMove: () => {
                        a !== n && (W.current = !0, x(n));
                      },
                      onClick: () => M(e),
                      className: b(
                        "zen-col-span-full zen-mx-1 zen-grid zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-px-2 zen-py-1.5",
                        a === n && "zen-bg-zen-muted",
                        o && "zen-font-medium zen-text-zen-primary"
                      ),
                      style: { gridTemplateColumns: "subgrid" },
                      children: u.map((l) => /* @__PURE__ */ c(
                        "div",
                        {
                          className: b("zen-min-w-0 zen-truncate", l.align === "end" && "zen-text-end zen-tabular-nums"),
                          children: De(S(l, e))
                        },
                        l.key
                      ))
                    },
                    m(e)
                  );
                })
              }
            ) : /* @__PURE__ */ c("div", { className: "zen-col-span-full zen-px-3 zen-py-2 zen-text-zen-muted-fg", children: oe })
          ]
        }
      ),
      document.body
    )
  ] });
}
export {
  Pe as LookupField
};
//# sourceMappingURL=index139.js.map
