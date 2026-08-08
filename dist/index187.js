import { a as pe } from "./index222.js";
import { Dialog as ge, DialogPortal as he, DialogOverlay as be, Content as Ee } from "./index168.js";
import * as n from "react";
import { Primitive as I } from "./index203.js";
import { useId as K } from "./index199.js";
import { composeRefs as q } from "./index192.js";
var $ = '[cmdk-group=""]', X = '[cmdk-group-items=""]', ye = '[cmdk-group-heading=""]', oe = '[cmdk-item=""]', ie = `${oe}:not([aria-disabled="true"])`, Y = "cmdk-item-select", P = "data-value", Ce = (t, a, r) => pe(t, a, r), ce = n.createContext(void 0), O = () => n.useContext(ce), de = n.createContext(void 0), Z = () => n.useContext(de), se = n.createContext(void 0), fe = n.forwardRef((t, a) => {
  let r = F(() => {
    var e, u;
    return { search: "", value: (u = (e = t.value) != null ? e : t.defaultValue) != null ? u : "", selectedItemId: void 0, filtered: { count: 0, items: /* @__PURE__ */ new Map(), groups: /* @__PURE__ */ new Set() } };
  }), v = F(() => /* @__PURE__ */ new Set()), i = F(() => /* @__PURE__ */ new Map()), c = F(() => /* @__PURE__ */ new Map()), d = F(() => /* @__PURE__ */ new Set()), m = me(t), { label: b, children: s, value: h, onValueChange: R, filter: k, shouldFilter: w, loop: V, disablePointerSelection: B = !1, vimBindings: x = !0, ...j } = t, U = K(), ee = K(), W = K(), A = n.useRef(null), g = Fe();
  D(() => {
    if (h !== void 0) {
      let e = h.trim();
      r.current.value = e, y.emit();
    }
  }, [h]), D(() => {
    g(6, re);
  }, []);
  let y = n.useMemo(() => ({ subscribe: (e) => (d.current.add(e), () => d.current.delete(e)), snapshot: () => r.current, setState: (e, u, o) => {
    var l, f, p, C;
    if (!Object.is(r.current[e], u)) {
      if (r.current[e] = u, e === "search") T(), G(), g(1, H);
      else if (e === "value") {
        if (document.activeElement.hasAttribute("cmdk-input") || document.activeElement.hasAttribute("cmdk-root")) {
          let E = document.getElementById(W);
          E ? E.focus() : (l = document.getElementById(U)) == null || l.focus();
        }
        if (g(7, () => {
          var E;
          r.current.selectedItemId = (E = M()) == null ? void 0 : E.id, y.emit();
        }), o || g(5, re), ((f = m.current) == null ? void 0 : f.value) !== void 0) {
          let E = u ?? "";
          (C = (p = m.current).onValueChange) == null || C.call(p, E);
          return;
        }
      }
      y.emit();
    }
  }, emit: () => {
    d.current.forEach((e) => e());
  } }), []), _ = n.useMemo(() => ({ value: (e, u, o) => {
    var l;
    u !== ((l = c.current.get(e)) == null ? void 0 : l.value) && (c.current.set(e, { value: u, keywords: o }), r.current.filtered.items.set(e, te(u, o)), g(2, () => {
      G(), y.emit();
    }));
  }, item: (e, u) => (v.current.add(e), u && (i.current.has(u) ? i.current.get(u).add(e) : i.current.set(u, /* @__PURE__ */ new Set([e]))), g(3, () => {
    T(), G(), r.current.value || H(), y.emit();
  }), () => {
    c.current.delete(e), v.current.delete(e), r.current.filtered.items.delete(e);
    let o = M();
    g(4, () => {
      T(), o?.getAttribute("id") === e && H(), y.emit();
    });
  }), group: (e) => (i.current.has(e) || i.current.set(e, /* @__PURE__ */ new Set()), () => {
    c.current.delete(e), i.current.delete(e);
  }), filter: () => m.current.shouldFilter, label: b || t["aria-label"], getDisablePointerSelection: () => m.current.disablePointerSelection, listId: U, inputId: W, labelId: ee, listInnerRef: A }), []);
  function te(e, u) {
    var o, l;
    let f = (l = (o = m.current) == null ? void 0 : o.filter) != null ? l : Ce;
    return e ? f(e, r.current.search, u) : 0;
  }
  function G() {
    if (!r.current.search || m.current.shouldFilter === !1) return;
    let e = r.current.filtered.items, u = [];
    r.current.filtered.groups.forEach((l) => {
      let f = i.current.get(l), p = 0;
      f.forEach((C) => {
        let E = e.get(C);
        p = Math.max(E, p);
      }), u.push([l, p]);
    });
    let o = A.current;
    L().sort((l, f) => {
      var p, C;
      let E = l.getAttribute("id"), N = f.getAttribute("id");
      return ((p = e.get(N)) != null ? p : 0) - ((C = e.get(E)) != null ? C : 0);
    }).forEach((l) => {
      let f = l.closest(X);
      f ? f.appendChild(l.parentElement === f ? l : l.closest(`${X} > *`)) : o.appendChild(l.parentElement === o ? l : l.closest(`${X} > *`));
    }), u.sort((l, f) => f[1] - l[1]).forEach((l) => {
      var f;
      let p = (f = A.current) == null ? void 0 : f.querySelector(`${$}[${P}="${encodeURIComponent(l[0])}"]`);
      p?.parentElement.appendChild(p);
    });
  }
  function H() {
    let e = L().find((o) => o.getAttribute("aria-disabled") !== "true"), u = e?.getAttribute(P);
    y.setState("value", u || void 0);
  }
  function T() {
    var e, u, o, l;
    if (!r.current.search || m.current.shouldFilter === !1) {
      r.current.filtered.count = v.current.size;
      return;
    }
    r.current.filtered.groups = /* @__PURE__ */ new Set();
    let f = 0;
    for (let p of v.current) {
      let C = (u = (e = c.current.get(p)) == null ? void 0 : e.value) != null ? u : "", E = (l = (o = c.current.get(p)) == null ? void 0 : o.keywords) != null ? l : [], N = te(C, E);
      r.current.filtered.items.set(p, N), N > 0 && f++;
    }
    for (let [p, C] of i.current) for (let E of C) if (r.current.filtered.items.get(E) > 0) {
      r.current.filtered.groups.add(p);
      break;
    }
    r.current.filtered.count = f;
  }
  function re() {
    var e, u, o;
    let l = M();
    l && (((e = l.parentElement) == null ? void 0 : e.firstChild) === l && ((o = (u = l.closest($)) == null ? void 0 : u.querySelector(ye)) == null || o.scrollIntoView({ block: "nearest" })), l.scrollIntoView({ block: "nearest" }));
  }
  function M() {
    var e;
    return (e = A.current) == null ? void 0 : e.querySelector(`${oe}[aria-selected="true"]`);
  }
  function L() {
    var e;
    return Array.from(((e = A.current) == null ? void 0 : e.querySelectorAll(ie)) || []);
  }
  function J(e) {
    let u = L()[e];
    u && y.setState("value", u.getAttribute(P));
  }
  function Q(e) {
    var u;
    let o = M(), l = L(), f = l.findIndex((C) => C === o), p = l[f + e];
    (u = m.current) != null && u.loop && (p = f + e < 0 ? l[l.length - 1] : f + e === l.length ? l[0] : l[f + e]), p && y.setState("value", p.getAttribute(P));
  }
  function ne(e) {
    let u = M(), o = u?.closest($), l;
    for (; o && !l; ) o = e > 0 ? Me(o, $) : Pe(o, $), l = o?.querySelector(ie);
    l ? y.setState("value", l.getAttribute(P)) : Q(e);
  }
  let le = () => J(L().length - 1), ae = (e) => {
    e.preventDefault(), e.metaKey ? le() : e.altKey ? ne(1) : Q(1);
  }, ue = (e) => {
    e.preventDefault(), e.metaKey ? J(0) : e.altKey ? ne(-1) : Q(-1);
  };
  return n.createElement(I.div, { ref: a, tabIndex: -1, ...j, "cmdk-root": "", onKeyDown: (e) => {
    var u;
    (u = j.onKeyDown) == null || u.call(j, e);
    let o = e.nativeEvent.isComposing || e.keyCode === 229;
    if (!(e.defaultPrevented || o)) switch (e.key) {
      case "n":
      case "j": {
        x && e.ctrlKey && ae(e);
        break;
      }
      case "ArrowDown": {
        ae(e);
        break;
      }
      case "p":
      case "k": {
        x && e.ctrlKey && ue(e);
        break;
      }
      case "ArrowUp": {
        ue(e);
        break;
      }
      case "Home": {
        e.preventDefault(), J(0);
        break;
      }
      case "End": {
        e.preventDefault(), le();
        break;
      }
      case "Enter": {
        e.preventDefault();
        let l = M();
        if (l) {
          let f = new Event(Y);
          l.dispatchEvent(f);
        }
      }
    }
  } }, n.createElement("label", { "cmdk-label": "", htmlFor: _.inputId, id: _.labelId, style: Le }, b), z(t, (e) => n.createElement(de.Provider, { value: y }, n.createElement(ce.Provider, { value: _ }, e))));
}), we = n.forwardRef((t, a) => {
  var r, v;
  let i = K(), c = n.useRef(null), d = n.useContext(se), m = O(), b = me(t), s = (v = (r = b.current) == null ? void 0 : r.forceMount) != null ? v : d?.forceMount;
  D(() => {
    if (!s) return m.item(i, d?.id);
  }, [s]);
  let h = ve(i, c, [t.value, t.children, c], t.keywords), R = Z(), k = S((g) => g.value && g.value === h.current), w = S((g) => s || m.filter() === !1 ? !0 : g.search ? g.filtered.items.get(i) > 0 : !0);
  n.useEffect(() => {
    let g = c.current;
    if (!(!g || t.disabled)) return g.addEventListener(Y, V), () => g.removeEventListener(Y, V);
  }, [w, t.onSelect, t.disabled]);
  function V() {
    var g, y;
    B(), (y = (g = b.current).onSelect) == null || y.call(g, h.current);
  }
  function B() {
    R.setState("value", h.current, !0);
  }
  if (!w) return null;
  let { disabled: x, value: j, onSelect: U, forceMount: ee, keywords: W, ...A } = t;
  return n.createElement(I.div, { ref: q(c, a), ...A, id: i, "cmdk-item": "", role: "option", "aria-disabled": !!x, "aria-selected": !!k, "data-disabled": !!x, "data-selected": !!k, onPointerMove: x || m.getDisablePointerSelection() ? void 0 : B, onClick: x ? void 0 : V }, t.children);
}), ke = n.forwardRef((t, a) => {
  let { heading: r, children: v, forceMount: i, ...c } = t, d = K(), m = n.useRef(null), b = n.useRef(null), s = K(), h = O(), R = S((w) => i || h.filter() === !1 ? !0 : w.search ? w.filtered.groups.has(d) : !0);
  D(() => h.group(d), []), ve(d, m, [t.value, t.heading, b]);
  let k = n.useMemo(() => ({ id: d, forceMount: i }), [i]);
  return n.createElement(I.div, { ref: q(m, a), ...c, "cmdk-group": "", role: "presentation", hidden: R ? void 0 : !0 }, r && n.createElement("div", { ref: b, "cmdk-group-heading": "", "aria-hidden": !0, id: s }, r), z(t, (w) => n.createElement("div", { "cmdk-group-items": "", role: "group", "aria-labelledby": r ? s : void 0 }, n.createElement(se.Provider, { value: k }, w))));
}), Se = n.forwardRef((t, a) => {
  let { alwaysRender: r, ...v } = t, i = n.useRef(null), c = S((d) => !d.search);
  return !r && !c ? null : n.createElement(I.div, { ref: q(i, a), ...v, "cmdk-separator": "", role: "separator" });
}), Ie = n.forwardRef((t, a) => {
  let { onValueChange: r, ...v } = t, i = t.value != null, c = Z(), d = S((s) => s.search), m = S((s) => s.selectedItemId), b = O();
  return n.useEffect(() => {
    t.value != null && c.setState("search", t.value);
  }, [t.value]), n.createElement(I.input, { ref: a, ...v, "cmdk-input": "", autoComplete: "off", autoCorrect: "off", spellCheck: !1, "aria-autocomplete": "list", role: "combobox", "aria-expanded": !0, "aria-controls": b.listId, "aria-labelledby": b.labelId, "aria-activedescendant": m, id: b.inputId, type: "text", value: i ? t.value : d, onChange: (s) => {
    i || c.setState("search", s.target.value), r?.(s.target.value);
  } });
}), Re = n.forwardRef((t, a) => {
  let { children: r, label: v = "Suggestions", ...i } = t, c = n.useRef(null), d = n.useRef(null), m = S((s) => s.selectedItemId), b = O();
  return n.useEffect(() => {
    if (d.current && c.current) {
      let s = d.current, h = c.current, R, k = new ResizeObserver(() => {
        R = requestAnimationFrame(() => {
          let w = s.offsetHeight;
          h.style.setProperty("--cmdk-list-height", w.toFixed(1) + "px");
        });
      });
      return k.observe(s), () => {
        cancelAnimationFrame(R), k.unobserve(s);
      };
    }
  }, []), n.createElement(I.div, { ref: q(c, a), ...i, "cmdk-list": "", role: "listbox", tabIndex: -1, "aria-activedescendant": m, "aria-label": v, id: b.listId }, z(t, (s) => n.createElement("div", { ref: q(d, b.listInnerRef), "cmdk-list-sizer": "" }, s)));
}), xe = n.forwardRef((t, a) => {
  let { open: r, onOpenChange: v, overlayClassName: i, contentClassName: c, container: d, ...m } = t;
  return n.createElement(ge, { open: r, onOpenChange: v }, n.createElement(he, { container: d }, n.createElement(be, { "cmdk-overlay": "", className: i }), n.createElement(Ee, { "aria-label": t.label, "cmdk-dialog": "", className: c }, n.createElement(fe, { ref: a, ...m }))));
}), Ae = n.forwardRef((t, a) => S((r) => r.filtered.count === 0) ? n.createElement(I.div, { ref: a, ...t, "cmdk-empty": "", role: "presentation" }) : null), De = n.forwardRef((t, a) => {
  let { progress: r, children: v, label: i = "Loading...", ...c } = t;
  return n.createElement(I.div, { ref: a, ...c, "cmdk-loading": "", role: "progressbar", "aria-valuenow": r, "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": i }, z(t, (d) => n.createElement("div", { "aria-hidden": !0 }, d)));
}), Ne = Object.assign(fe, { List: Re, Item: we, Input: Ie, Group: ke, Separator: Se, Dialog: xe, Empty: Ae, Loading: De });
function Me(t, a) {
  let r = t.nextElementSibling;
  for (; r; ) {
    if (r.matches(a)) return r;
    r = r.nextElementSibling;
  }
}
function Pe(t, a) {
  let r = t.previousElementSibling;
  for (; r; ) {
    if (r.matches(a)) return r;
    r = r.previousElementSibling;
  }
}
function me(t) {
  let a = n.useRef(t);
  return D(() => {
    a.current = t;
  }), a;
}
var D = typeof window > "u" ? n.useEffect : n.useLayoutEffect;
function F(t) {
  let a = n.useRef();
  return a.current === void 0 && (a.current = t()), a;
}
function S(t) {
  let a = Z(), r = () => t(a.snapshot());
  return n.useSyncExternalStore(a.subscribe, r, r);
}
function ve(t, a, r, v = []) {
  let i = n.useRef(), c = O();
  return D(() => {
    var d;
    let m = (() => {
      var s;
      for (let h of r) {
        if (typeof h == "string") return h.trim();
        if (typeof h == "object" && "current" in h) return h.current ? (s = h.current.textContent) == null ? void 0 : s.trim() : i.current;
      }
    })(), b = v.map((s) => s.trim());
    c.value(t, m, b), (d = a.current) == null || d.setAttribute(P, m), i.current = m;
  }), i;
}
var Fe = () => {
  let [t, a] = n.useState(), r = F(() => /* @__PURE__ */ new Map());
  return D(() => {
    r.current.forEach((v) => v()), r.current = /* @__PURE__ */ new Map();
  }, [t]), (v, i) => {
    r.current.set(v, i), a({});
  };
};
function Ke(t) {
  let a = t.type;
  return typeof a == "function" ? a(t.props) : "render" in a ? a.render(t.props) : t;
}
function z({ asChild: t, children: a }, r) {
  return t && n.isValidElement(a) ? n.cloneElement(Ke(a), { ref: a.ref }, r(a.props.children)) : r(a);
}
var Le = { position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0" };
export {
  Ne as Command,
  xe as CommandDialog,
  Ae as CommandEmpty,
  ke as CommandGroup,
  Ie as CommandInput,
  we as CommandItem,
  Re as CommandList,
  De as CommandLoading,
  fe as CommandRoot,
  Se as CommandSeparator,
  Ce as defaultFilter,
  S as useCommandState
};
//# sourceMappingURL=index187.js.map
