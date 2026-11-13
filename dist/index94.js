import { jsxs as A, Fragment as C, jsx as o } from "react/jsx-runtime";
import * as l from "react";
import { Icon as D } from "./index63.js";
import { Skeleton as I } from "./index68.js";
import { useLocale as K } from "./index90.js";
import { cn as y } from "./index197.js";
const L = "zen-group zen-flex zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-p-3 zen-text-start zen-text-zen-foreground zen-no-underline", E = "zen-cursor-pointer zen-transition-colors hover:zen-border-zen-primary hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2", G = ({
  title: x,
  subtitle: p,
  avatar: h,
  icon: g,
  href: i,
  as: b,
  onClick: a,
  loading: s,
  disabled: r,
  locked: t,
  lockedLabel: v,
  className: u
}) => {
  const c = K(), z = y(
    L,
    !r && !!(i || a) && E,
    r && "zen-cursor-not-allowed zen-opacity-50",
    t && "zen-border-dashed zen-bg-zen-muted/40",
    u
  ), f = s || void 0, e = /* @__PURE__ */ A(C, { children: [
    /* @__PURE__ */ o(
      "span",
      {
        "aria-hidden": "true",
        className: y(
          "zen-flex zen-h-10 zen-w-10 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-md zen-text-sm zen-font-semibold",
          t ? "zen-bg-zen-muted zen-text-zen-muted-fg" : "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"
        ),
        children: g || (h ?? "").slice(0, 2).toUpperCase()
      }
    ),
    /* @__PURE__ */ A("span", { className: "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-0.5", children: [
      /* @__PURE__ */ o("span", { className: y("zen-truncate zen-text-sm zen-font-medium", t && "zen-text-zen-muted-fg"), children: x }),
      s ? /* @__PURE__ */ o(I, { className: "zen-h-3 zen-w-20" }) : t || p !== void 0 ? /* @__PURE__ */ o("span", { className: "zen-truncate zen-text-xs zen-text-zen-muted-fg", children: t ? v ?? c.t("tile.locked") : p }) : null
    ] }),
    t && /* @__PURE__ */ o(D, { name: "lock", size: 14, className: "zen-shrink-0 zen-text-zen-muted-fg" })
  ] });
  return i && !r ? /* @__PURE__ */ o(b ?? "a", { "data-tile": "", href: i, ...b ? { to: i } : {}, className: z, "aria-busy": f, onClick: a, children: e }) : a || i && r ? /* @__PURE__ */ o(
    "button",
    {
      type: "button",
      "data-tile": "",
      className: z,
      disabled: r,
      "aria-busy": f,
      onClick: (n) => a?.(n),
      children: e
    }
  ) : /* @__PURE__ */ o("div", { "data-tile": "", className: z, "aria-busy": f, "aria-disabled": r || void 0, children: e });
}, M = l.forwardRef(
  ({ className: x, children: p, minTileWidth: h, style: g, onKeyDown: i, onFocus: b, ...a }, s) => {
    const r = l.useRef(null), t = l.useRef(null), v = l.useCallback(
      (e) => {
        r.current = e, typeof s == "function" ? s(e) : s && (s.current = e);
      },
      [s]
    ), u = l.useCallback(() => {
      const e = r.current;
      return e ? [...e.querySelectorAll("[data-tile]")].filter(
        (n) => n.tagName !== "DIV" && !n.disabled
      ) : [];
    }, []), c = l.useCallback(() => {
      const e = u();
      (!t.current || !e.includes(t.current)) && (t.current = e[0] ?? null);
      for (const n of e) n.tabIndex = n === t.current ? 0 : -1;
    }, [u]);
    l.useEffect(() => {
      const e = r.current;
      if (!e) return;
      c();
      const n = new MutationObserver(c);
      return n.observe(e, { childList: !0, subtree: !0 }), () => n.disconnect();
    }, [c]);
    const w = (e) => {
      const n = e[0]?.offsetTop;
      return Math.max(1, e.filter((m) => m.offsetTop === n).length);
    }, z = (e) => {
      if (i?.(e), e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const n = u(), m = n.indexOf(e.target);
      if (m < 0) return;
      const N = getComputedStyle(r.current).direction === "rtl", T = w(n), R = {
        ArrowRight: N ? -1 : 1,
        ArrowLeft: N ? 1 : -1,
        ArrowDown: T,
        ArrowUp: -T
      };
      let d = null;
      if (e.key in R ? d = m + R[e.key] : e.key === "Home" ? d = 0 : e.key === "End" && (d = n.length - 1), d === null) return;
      e.preventDefault();
      const k = n[Math.min(Math.max(d, 0), n.length - 1)];
      t.current = k, c(), k.focus();
    }, f = (e) => {
      b?.(e);
      const n = e.target.closest?.("[data-tile]");
      n && u().includes(n) && n !== t.current && (t.current = n, c());
    };
    return /* @__PURE__ */ o(
      "div",
      {
        ref: v,
        role: "group",
        className: y("zen-grid zen-w-full zen-gap-3", x),
        style: {
          gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${h ?? "var(--zen-tile-min-width)"}), 1fr))`,
          ...g
        },
        onKeyDown: z,
        onFocus: f,
        ...a,
        children: p
      }
    );
  }
);
M.displayName = "TileGrid";
export {
  G as Tile,
  M as TileGrid
};
//# sourceMappingURL=index94.js.map
