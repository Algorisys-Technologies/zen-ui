import { jsx as d, jsxs as N } from "react/jsx-runtime";
import * as t from "react";
import { parseChord as k, chordParts as L, chordLabel as R, isReservedChord as j, sameChord as E, ariaKeyshortcut as F, isTypingTarget as I, matchesChord as M } from "./index192.js";
import { Dialog as P, DialogContent as T, DialogHeader as A, DialogTitle as H } from "./index79.js";
import { useLocale as O } from "./index90.js";
import { cn as G } from "./index160.js";
const b = t.createContext(void 0);
function S() {
  if (typeof navigator > "u") return "other";
  const s = navigator.userAgentData?.platform ?? navigator.platform ?? navigator.userAgent ?? "";
  return /mac|iphone|ipad|ipod/i.test(s) ? "mac" : "other";
}
function W(e) {
  if (e)
    return typeof e == "function" ? e() : e.current;
}
const U = ({ children: e, platform: s }) => {
  const [n] = t.useState(() => s ?? S()), i = t.useRef([]), [l, u] = t.useState([]), m = t.useRef(1), h = t.useCallback(
    (r) => {
      const c = k(r.text);
      if (j(c, n))
        return console.warn(`[zen-ui shortcuts] "${r.text}" is kept by the browser or the system; it was not registered.`), () => {
        };
      const z = i.current.find(
        (p) => E(p.chord, c, n) && p.scoped === r.scoped && (!r.scoped || p.scope() === r.scope())
      );
      z && console.warn(
        `[zen-ui shortcuts] "${r.text}" (${r.description ?? "no description"}) is already "${z.description ?? z.text}" in the same place; the first one keeps it.`
      );
      const x = { ...r, id: m.current++, chord: c };
      return i.current = [...i.current, x], u(i.current), () => {
        i.current = i.current.filter((p) => p.id !== x.id), u(i.current);
      };
    },
    [n]
  );
  t.useEffect(() => {
    const r = (c) => {
      if (c.defaultPrevented || c.isComposing) return;
      const z = c.target, x = I(z), p = i.current.filter(
        (f) => f.enabled() && (!x || f.allowInFields()) && M(c, f.chord, n)
      );
      if (p.length === 0) return;
      const v = p.filter((f) => {
        const a = f.scope();
        return !!a && !!z && a.contains(z);
      }), o = v.length ? v[v.length - 1] : p.find((f) => !f.scoped);
      o && (c.preventDefault(), o.handler(c));
    };
    return document.addEventListener("keydown", r), () => document.removeEventListener("keydown", r);
  }, [n]);
  const g = t.useMemo(() => ({ platform: n, register: h, list: l }), [n, h, l]);
  return /* @__PURE__ */ d(b.Provider, { value: g, children: e });
};
function V() {
  return t.useContext(b);
}
function $(e, s, n) {
  const i = t.useContext(b), l = t.useRef({ handler: s, options: n });
  l.current = { handler: s, options: n };
  const u = i?.register, { description: m, group: h, hidden: g } = n, r = !!n.within;
  t.useEffect(() => {
    if (e !== null) {
      if (!u) {
        console.warn(`[zen-ui shortcuts] useShortcut("${e}") outside a ShortcutProvider does nothing.`);
        return;
      }
      return u({
        text: e,
        description: m,
        group: h,
        hidden: g,
        scoped: r,
        scope: () => W(l.current.options.within),
        allowInFields: () => !!l.current.options.allowInFields,
        enabled: () => l.current.options.enabled?.() ?? !0,
        handler: (c) => l.current.handler(c)
      });
    }
  }, [u, e, m, h, g, r]);
}
function X(e, s, n = {}) {
  $(e, s, n);
}
function Y(e, s = S()) {
  return F(k(e), s);
}
function Z(e, s = S()) {
  return R(k(e), s);
}
const D = t.forwardRef(({ keys: e, platform: s, className: n, ...i }, l) => {
  const u = t.useContext(b), m = s ?? u?.platform ?? S(), h = t.useMemo(() => k(e), [e]);
  return /* @__PURE__ */ d(
    "span",
    {
      ref: l,
      role: "group",
      "aria-label": R(h, m),
      className: G("zen-inline-flex zen-items-center zen-gap-0.5 zen-align-middle", n),
      ...i,
      children: L(h, m).map((g, r) => /* @__PURE__ */ d(
        "kbd",
        {
          "aria-hidden": "true",
          className: "zen-inline-flex zen-min-w-5 zen-items-center zen-justify-center zen-rounded-zen-sm zen-border zen-border-solid zen-border-zen-border zen-bg-zen-muted zen-px-1 zen-font-sans zen-text-xs zen-font-medium zen-leading-5 zen-text-zen-foreground",
          children: g
        },
        r
      ))
    }
  );
});
D.displayName = "Kbd";
const ee = ({ openKey: e, open: s, onOpenChange: n, extra: i, title: l }) => {
  const u = O(), m = t.useContext(b), [h, g] = t.useState(!1), r = s ?? h, c = (o) => {
    s === void 0 && g(o), n?.(o);
  }, [z] = t.useState(() => e === void 0 ? "?" : e);
  $(z || null, () => c(!0), {
    description: u.t("shortcuts.showTheseKeys"),
    group: u.t("shortcuts.general")
  });
  const x = m?.list, p = u.t("shortcuts.general"), v = t.useMemo(() => {
    const o = /* @__PURE__ */ new Map();
    for (const a of x ?? []) {
      if (a.hidden || !a.description) continue;
      const y = a.group ?? p;
      o.has(y) || o.set(y, []);
      const w = o.get(y), C = w.find((K) => K.description === a.description);
      C ? C.keys.push(a.text) : w.push({ keys: [a.text], description: a.description });
    }
    return [...[...o].map(([a, y]) => ({ title: a, shortcuts: y })), ...i ?? []];
  }, [x, p, i]);
  return /* @__PURE__ */ d(P, { open: r, onOpenChange: c, children: /* @__PURE__ */ N(T, { className: "zen-max-w-xl", children: [
    /* @__PURE__ */ d(A, { children: /* @__PURE__ */ d(H, { children: l ?? u.t("shortcuts.keyboardShortcuts") }) }),
    /* @__PURE__ */ d("div", { className: "zen-flex zen-max-h-[60vh] zen-flex-col zen-gap-5 zen-overflow-y-auto", "data-shortcut-help": "", children: v.map((o, f) => /* @__PURE__ */ N("section", { children: [
      /* @__PURE__ */ d("h3", { className: "zen-m-0 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", children: o.title }),
      o.where && /* @__PURE__ */ d("p", { className: "zen-m-0 zen-mt-0.5 zen-text-xs zen-text-zen-muted-fg", children: o.where }),
      /* @__PURE__ */ d("dl", { className: "zen-m-0 zen-mt-2 zen-grid zen-grid-cols-[minmax(0,1fr)_auto] zen-items-center zen-gap-x-4 zen-gap-y-1.5 zen-text-sm", children: o.shortcuts.map((a, y) => /* @__PURE__ */ N(t.Fragment, { children: [
        /* @__PURE__ */ d("dt", { className: "zen-m-0", children: a.description }),
        /* @__PURE__ */ d("dd", { className: "zen-m-0 zen-flex zen-flex-wrap zen-justify-end zen-gap-1.5", children: a.keys.map((w, C) => /* @__PURE__ */ d(D, { keys: w }, C)) })
      ] }, y)) })
    ] }, `${f}:${o.title}`)) })
  ] }) });
};
export {
  D as Kbd,
  ee as ShortcutHelp,
  U as ShortcutProvider,
  S as detectPlatform,
  Y as keyshortcut,
  Z as shortcutLabel,
  X as useShortcut,
  V as useShortcuts
};
//# sourceMappingURL=index74.js.map
