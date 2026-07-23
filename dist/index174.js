import { DATA_TOP_LAYER_ATTR as N } from "./index180.js";
import { DATA_LIVE_ANNOUNCER_ATTR as b } from "./index181.js";
import { createEffect as p, onCleanup as A } from "solid-js";
import { access as u } from "./index166.js";
function F(s) {
  p(() => {
    u(s.isDisabled) || A(g(u(s.targets), u(s.root)));
  });
}
var a = /* @__PURE__ */ new WeakMap(), r = [];
function g(s, l = document.body) {
  const i = new Set(s), c = /* @__PURE__ */ new Set(), E = (e) => {
    for (const o of e.querySelectorAll(`[${b}], [${N}]`))
      i.add(o);
    const t = (o) => {
      if (i.has(o) || o.parentElement && c.has(o.parentElement) && o.parentElement.getAttribute("role") !== "row")
        return NodeFilter.FILTER_REJECT;
      for (const h of i)
        if (o.contains(h))
          return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    }, n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
      acceptNode: t
    }), T = t(e);
    if (T === NodeFilter.FILTER_ACCEPT && m(e), T !== NodeFilter.FILTER_REJECT) {
      let o = n.nextNode();
      for (; o != null; )
        m(o), o = n.nextNode();
    }
  }, m = (e) => {
    const t = a.get(e) ?? 0;
    e.getAttribute("aria-hidden") === "true" && t === 0 || (t === 0 && e.setAttribute("aria-hidden", "true"), c.add(e), a.set(e, t + 1));
  };
  r.length && r[r.length - 1].disconnect(), E(l);
  const d = new MutationObserver((e) => {
    for (const t of e)
      if (!(t.type !== "childList" || t.addedNodes.length === 0) && ![...i, ...c].some((n) => n.contains(t.target))) {
        for (const n of t.removedNodes)
          n instanceof Element && (i.delete(n), c.delete(n));
        for (const n of t.addedNodes)
          (n instanceof HTMLElement || n instanceof SVGElement) && (n.dataset.liveAnnouncer === "true" || n.dataset.reactAriaTopLayer === "true") ? i.add(n) : n instanceof Element && E(n);
      }
  });
  d.observe(l, {
    childList: !0,
    subtree: !0
  });
  const f = {
    observe() {
      d.observe(l, {
        childList: !0,
        subtree: !0
      });
    },
    disconnect() {
      d.disconnect();
    }
  };
  return r.push(f), () => {
    d.disconnect();
    for (const e of c) {
      const t = a.get(e);
      if (t == null)
        return;
      t === 1 ? (e.removeAttribute("aria-hidden"), a.delete(e)) : a.set(e, t - 1);
    }
    f === r[r.length - 1] ? (r.pop(), r.length && r[r.length - 1].observe()) : r.splice(r.indexOf(f), 1);
  };
}
export {
  g as ariaHideOutside,
  F as createHideOutside
};
//# sourceMappingURL=index174.js.map
