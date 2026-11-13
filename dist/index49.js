import { jsxs as u, jsx as o, Fragment as F } from "react/jsx-runtime";
import * as s from "react";
import { Icon as g } from "./index63.js";
import { DropdownMenu as H, DropdownMenuTrigger as S, DropdownMenuContent as q, DropdownMenuItem as G } from "./index73.js";
import { useLocale as J } from "./index90.js";
import { cn as l } from "./index197.js";
const D = "zen-inline-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground zen-cursor-pointer", Q = s.forwardRef(
  ({ tabs: i, activeId: c, onSelect: k, onClose: v, onPinChange: w, panelId: T, label: L, allTabsLabel: R, closeLabel: M, className: W, ...E }, O) => {
    const a = J(), d = s.useRef(null), p = s.useRef(/* @__PURE__ */ new Map()), [C, $] = s.useState(!1), N = s.useRef(c);
    N.current = c;
    const j = i.some((e) => e.id === c) ? c : i[0]?.id, z = s.useCallback(() => {
      const e = d.current;
      e && $(e.scrollWidth > e.clientWidth + 1);
    }, []), m = s.useCallback((e) => {
      const n = d.current, t = e ? p.current.get(e)?.parentElement : void 0;
      if (!t || !n) return;
      const r = t.offsetLeft, f = r + t.offsetWidth;
      r < n.scrollLeft ? n.scrollLeft = r : f > n.scrollLeft + n.clientWidth && (n.scrollLeft = f - n.clientWidth);
    }, []), b = s.useRef(null), h = s.useRef(/* @__PURE__ */ new Map());
    s.useLayoutEffect(() => {
      if (z(), typeof ResizeObserver > "u") return;
      const e = new ResizeObserver(() => {
        z(), m(N.current);
      });
      return b.current = e, d.current && e.observe(d.current), h.current.forEach((n) => e.observe(n)), () => {
        e.disconnect(), b.current = null;
      };
    }, [z, m]), s.useLayoutEffect(() => {
      z(), m(c);
    }, [c, i.length, z, m]);
    const x = s.useRef(/* @__PURE__ */ new Map()), A = (e) => {
      let n = x.current.get(e);
      return n || (n = (t) => {
        const r = h.current.get(e);
        r && r !== t && (b.current?.unobserve(r), h.current.delete(e)), t ? (h.current.set(e, t), b.current?.observe(t)) : (p.current.delete(e), x.current.delete(e));
      }, x.current.set(e, n)), n;
    }, K = (e) => (n) => {
      n && p.current.set(e, n);
    }, y = (e) => {
      e.pinned || v?.(e.id);
    }, B = (e, n) => {
      const t = (r) => {
        const f = i[(r + i.length) % i.length];
        f && p.current.get(f.id)?.focus();
      };
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault(), t(n + 1);
          break;
        case "ArrowLeft":
          e.preventDefault(), t(n - 1);
          break;
        case "Home":
          e.preventDefault(), t(0);
          break;
        case "End":
          e.preventDefault(), t(i.length - 1);
          break;
        case "Delete": {
          const r = i[n];
          r && !r.pinned && v && (e.preventDefault(), t(n + 1 < i.length ? n + 1 : n - 1), y(r));
          break;
        }
      }
    };
    return /* @__PURE__ */ u(
      "div",
      {
        ref: O,
        className: l("zen-flex zen-w-full zen-items-stretch zen-border-b zen-border-zen-border", W),
        ...E,
        children: [
          /* @__PURE__ */ o(
            "div",
            {
              ref: d,
              role: "tablist",
              "aria-label": L ?? a.t("documentTabs.openDocuments"),
              "aria-orientation": "horizontal",
              className: "zen-relative zen-flex zen-min-w-0 zen-flex-1 zen-items-stretch zen-overflow-x-auto",
              style: { scrollbarWidth: "thin" },
              children: i.map((e, n) => {
                const t = e.id === c;
                return /* @__PURE__ */ u(
                  "div",
                  {
                    ref: A(e.id),
                    role: "presentation",
                    "data-active": t ? "" : void 0,
                    "data-pinned": e.pinned ? "" : void 0,
                    className: l(
                      "zen-group zen-relative zen-flex zen-shrink-0 zen-items-center zen-gap-1 zen-pl-3 zen-pr-1",
                      "-zen-mb-px zen-border-b-2 zen-border-transparent zen-text-sm",
                      "zen-max-w-[16rem]",
                      t ? "zen-border-zen-primary zen-text-zen-foreground zen-bg-zen-background" : "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted/50"
                    ),
                    onAuxClick: (r) => {
                      r.button === 1 && (r.preventDefault(), y(e));
                    },
                    onMouseDown: (r) => {
                      r.button === 1 && r.preventDefault();
                    },
                    children: [
                      /* @__PURE__ */ u(
                        "button",
                        {
                          ref: K(e.id),
                          type: "button",
                          role: "tab",
                          id: `zen-doc-tab-${e.id}`,
                          "aria-selected": t ? "true" : "false",
                          "aria-controls": T?.(e.id),
                          tabIndex: e.id === j ? 0 : -1,
                          title: e.description ? `${e.label} · ${e.description}` : e.label,
                          className: l(
                            "zen-flex zen-min-w-0 zen-items-center zen-gap-1.5 zen-py-2 zen-border-0 zen-bg-transparent zen-text-inherit zen-cursor-pointer",
                            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset zen-rounded-zen-sm"
                          ),
                          onClick: () => k(e.id),
                          onKeyDown: (r) => B(r, n),
                          children: [
                            e.pinned && !w && /* @__PURE__ */ o(g, { name: "pin", size: 12, "aria-hidden": "true", className: "zen-shrink-0" }),
                            e.description && /* @__PURE__ */ o("span", { className: "zen-shrink-0 zen-text-xs zen-text-zen-muted-fg", children: e.description }),
                            /* @__PURE__ */ o("span", { className: l("zen-truncate", t && "zen-font-medium"), children: e.label }),
                            e.dirty && /* @__PURE__ */ u(F, { children: [
                              /* @__PURE__ */ o("span", { className: "zen-h-1.5 zen-w-1.5 zen-shrink-0 zen-rounded-full zen-bg-zen-primary", "aria-hidden": "true" }),
                              /* @__PURE__ */ o("span", { className: "zen-sr-only", children: a.t("documentTabs.unsaved") })
                            ] })
                          ]
                        }
                      ),
                      w && /* @__PURE__ */ o(
                        "button",
                        {
                          type: "button",
                          tabIndex: -1,
                          "aria-label": a.t(e.pinned ? "documentTabs.unpinTab" : "documentTabs.pinTab", { label: e.label }),
                          "aria-pressed": e.pinned ? "true" : "false",
                          title: a.t(e.pinned ? "documentTabs.unpin" : "documentTabs.pin"),
                          className: l(D, e.pinned ? "zen-text-zen-primary" : "zen-opacity-0 group-hover:zen-opacity-100 group-focus-within:zen-opacity-100"),
                          onClick: () => w(e.id, !e.pinned),
                          children: /* @__PURE__ */ o(g, { name: "pin", size: 12 })
                        }
                      ),
                      v && !e.pinned && /* @__PURE__ */ o(
                        "button",
                        {
                          type: "button",
                          tabIndex: -1,
                          "aria-label": a.t("documentTabs.closeTab", { label: e.label }),
                          title: M?.(e) ?? a.t("documentTabs.close"),
                          className: l(D, !t && !e.dirty && "zen-opacity-0 group-hover:zen-opacity-100 group-focus-within:zen-opacity-100"),
                          onClick: () => y(e),
                          children: /* @__PURE__ */ o(g, { name: "x", size: 12 })
                        }
                      )
                    ]
                  },
                  e.id
                );
              })
            }
          ),
          C && /* @__PURE__ */ u(H, { children: [
            /* @__PURE__ */ o(
              S,
              {
                type: "button",
                "aria-label": R ?? a.t("documentTabs.allOpenDocumentsCount", { count: i.length }),
                title: R ?? a.t("documentTabs.allOpenDocuments"),
                className: l(D, "zen-h-auto zen-w-8 zen-rounded-none zen-border-l zen-border-zen-border"),
                children: /* @__PURE__ */ o(g, { name: "chevron-down", size: 14 })
              }
            ),
            /* @__PURE__ */ o(q, { align: "end", children: i.map((e) => /* @__PURE__ */ o(G, { onSelect: () => k(e.id), children: /* @__PURE__ */ u("span", { className: l("zen-truncate", e.id === c && "zen-font-medium"), children: [
              e.description ? `${e.description} · ` : "",
              e.label,
              e.dirty ? " •" : ""
            ] }) }, e.id)) })
          ] })
        ]
      }
    );
  }
);
Q.displayName = "DocumentTabs";
export {
  Q as DocumentTabs
};
//# sourceMappingURL=index49.js.map
