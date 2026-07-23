import { createComponent as w, template as g, spread as h, mergeProps as z, insert as f, setAttribute as C, memo as te, effect as ne, use as G, delegateEvents as re } from "solid-js/web";
import { splitProps as b, createSignal as F, createMemo as M, createUniqueId as _, onMount as R, createEffect as P, on as L, createContext as T, Show as q, useContext as H, onCleanup as le } from "solid-js";
import { createStore as oe, produce as ae } from "solid-js/store";
import { cn as x } from "./index103.js";
var se = /* @__PURE__ */ g("<label cmdk-label class=zen-sr-only>"), ie = /* @__PURE__ */ g("<div cmdk-root>"), ce = /* @__PURE__ */ g('<div class="zen-flex zen-items-center zen-border-b zen-border-zen-border zen-px-3"cmdk-input-wrapper><input cmdk-input type=text role=combobox autocomplete=off autocorrect=off aria-autocomplete=list>'), ue = /* @__PURE__ */ g("<div cmdk-list role=listbox>"), de = /* @__PURE__ */ g("<div cmdk-empty role=presentation>"), me = /* @__PURE__ */ g("<div cmdk-loading role=progressbar aria-valuemin=0 aria-valuemax=100>"), fe = /* @__PURE__ */ g("<div cmdk-group-heading aria-hidden=true>"), ge = /* @__PURE__ */ g("<div cmdk-group role=presentation><div cmdk-group-items role=group>"), pe = /* @__PURE__ */ g("<div cmdk-separator role=separator>"), ve = /* @__PURE__ */ g("<div cmdk-item role=option>"), he = /* @__PURE__ */ g('<svg width=16 height=16 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="zen-mr-2 zen-shrink-0 zen-opacity-50"aria-hidden=true><circle cx=11 cy=11 r=8></circle><line x1=21 y1=21 x2=16.65 y2=16.65>');
const U = (l) => l.toLowerCase().trim(), ze = (l, e, a) => {
  const t = U(e);
  if (!t) return 1;
  const r = U(a?.length ? `${l} ${a.join(" ")}` : l);
  if (!r) return 0;
  if (r === t) return 1;
  if (r.startsWith(t)) return 0.9;
  const s = r.indexOf(t);
  if (s > -1) return r[s - 1] === " " ? 0.8 : 0.7;
  let c = 0;
  for (const i of r)
    if (i === t[c] && (c += 1), c === t.length) break;
  return c === t.length ? 0.4 : 0;
}, W = T(), I = () => {
  const l = H(W);
  if (!l) throw new Error("Command components must be rendered inside <Command>");
  return l;
}, J = T(), we = (l) => {
  const [e, a] = b(l, ["label", "shouldFilter", "filter", "defaultValue", "value", "onValueChange", "loop", "disablePointerSelection", "vimBindings", "class", "children"]);
  let t;
  const [r, s] = F(""), [c, i] = F(e.defaultValue ?? ""), [v, u] = oe({
    items: {}
  }), p = () => e.value !== void 0 ? e.value : c(), k = (n) => {
    n !== p() && (i(n), e.onValueChange?.(n));
  }, A = () => e.shouldFilter ?? !0, E = () => e.filter ?? ze, d = () => e.disablePointerSelection ?? !1, y = () => e.vimBindings ?? !0, N = M(() => Object.values(v.items).filter((n) => n.score > 0).length), Q = M(() => {
    const n = p();
    return Object.entries(v.items).find(([, m]) => m.value === n && m.visible)?.[0];
  }), X = _(), j = _(), B = _(), S = () => Array.from(t?.querySelectorAll('[cmdk-item]:not([aria-disabled="true"]):not([hidden])') ?? []), V = (n) => {
    const m = S()[n];
    m && k(m.getAttribute("data-value") ?? "");
  }, D = (n) => {
    const o = S();
    if (o.length === 0) return;
    let $ = o.findIndex((ee) => ee.getAttribute("data-value") === p()) + n;
    e.loop ? $ = ($ % o.length + o.length) % o.length : $ = Math.max(0, Math.min($, o.length - 1));
    const K = o[$];
    K && k(K.getAttribute("data-value") ?? "");
  }, O = () => V(0);
  R(() => {
    queueMicrotask(() => {
      p() || O();
    });
  }), P(L(r, () => {
    queueMicrotask(O);
  }, {
    defer: !0
  })), P(L(p, (n) => {
    n && queueMicrotask(() => {
      t?.querySelector(`[cmdk-item][data-value="${CSS.escape(n)}"]`)?.scrollIntoView({
        block: "nearest"
      });
    });
  }));
  const Y = (n) => {
    if (n.isComposing || n.defaultPrevented) return;
    const o = y() && n.ctrlKey;
    switch (n.key) {
      case "n":
      case "j":
        o && (n.preventDefault(), D(1));
        return;
      case "p":
      case "k":
        o && (n.preventDefault(), D(-1));
        return;
      case "ArrowDown":
        n.preventDefault(), n.metaKey ? V(S().length - 1) : D(1);
        return;
      case "ArrowUp":
        n.preventDefault(), n.metaKey ? V(0) : D(-1);
        return;
      case "Home":
        n.preventDefault(), V(0);
        return;
      case "End":
        n.preventDefault(), V(S().length - 1);
        return;
      case "Enter": {
        n.preventDefault(), S().find(($) => $.getAttribute("data-value") === p())?.click();
        return;
      }
    }
  }, Z = {
    search: r,
    setSearch: s,
    value: p,
    setValue: k,
    shouldFilter: A,
    filter: E,
    disablePointerSelection: d,
    get items() {
      return v.items;
    },
    setItem: (n, o) => u("items", n, o),
    removeItem: (n) => u("items", ae((o) => {
      delete o[n];
    })),
    filteredCount: N,
    selectedItemId: Q,
    listId: X,
    labelId: j,
    inputId: B
  };
  return w(W.Provider, {
    value: Z,
    get children() {
      var n = ie();
      n.$$keydown = Y;
      var o = t;
      return typeof o == "function" ? G(o, n) : t = n, h(n, z({
        get class() {
          return x("zen-flex zen-h-full zen-w-full zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-bg-zen-background zen-text-zen-foreground", e.class);
        }
      }, a), !1, !0), f(n, w(q, {
        get when() {
          return e.label;
        },
        get children() {
          var m = se();
          return C(m, "for", B), C(m, "id", j), f(m, () => e.label), m;
        }
      }), null), f(n, () => e.children, null), n;
    }
  });
}, Ce = (l) => {
  const [e, a] = b(l, ["value", "onValueChange", "class"]), t = I();
  return P(() => {
    e.value !== void 0 && t.setSearch(e.value);
  }), (() => {
    var r = ce(), s = r.firstChild;
    return f(r, w(be, {}), s), s.$$input = (c) => {
      const i = c.currentTarget.value;
      e.value === void 0 && t.setSearch(i), e.onValueChange?.(i);
    }, C(s, "spellcheck", !1), C(s, "aria-expanded", !0), h(s, z({
      get id() {
        return t.inputId;
      },
      get "aria-controls"() {
        return t.listId;
      },
      get "aria-labelledby"() {
        return t.labelId;
      },
      get "aria-activedescendant"() {
        return t.selectedItemId();
      },
      get value() {
        return te(() => e.value !== void 0)() ? e.value : t.search();
      },
      get class() {
        return x("zen-flex zen-h-10 zen-w-full zen-bg-transparent zen-py-3 zen-text-sm zen-outline-none", "placeholder:zen-text-zen-muted-fg", "disabled:zen-cursor-not-allowed disabled:zen-opacity-50", e.class);
      }
    }, a), !1, !1), r;
  })();
}, _e = (l) => {
  const [e, a] = b(l, ["label", "class", "children"]), t = I();
  return (() => {
    var r = ue();
    return h(r, z({
      get id() {
        return t.listId;
      },
      get "aria-label"() {
        return e.label ?? "Suggestions";
      },
      get class() {
        return x("zen-max-h-72 zen-overflow-y-auto zen-overflow-x-hidden", e.class);
      }
    }, a), !1, !0), f(r, () => e.children), r;
  })();
}, Ie = (l) => {
  const [e, a] = b(l, ["class", "children"]), t = I();
  return w(q, {
    get when() {
      return t.filteredCount() === 0;
    },
    get children() {
      var r = de();
      return h(r, z({
        get class() {
          return x("zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg", e.class);
        }
      }, a), !1, !0), f(r, () => e.children), r;
    }
  });
}, Se = (l) => {
  const [e, a] = b(l, ["progress", "label", "class", "children"]);
  return (() => {
    var t = me();
    return h(t, z({
      get "aria-valuenow"() {
        return e.progress;
      },
      get "aria-label"() {
        return e.label ?? "Loading…";
      },
      get class() {
        return x("zen-py-4 zen-text-center zen-text-sm zen-text-zen-muted-fg", e.class);
      }
    }, a), !1, !0), f(t, () => e.children), t;
  })();
}, Ve = (l) => {
  const [e, a] = b(l, ["heading", "value", "forceMount", "class", "children"]), t = I(), r = _(), s = _(), c = M(() => e.forceMount || !t.shouldFilter() ? !0 : Object.values(t.items).some((i) => i.groupId === r && i.visible));
  return w(J.Provider, {
    value: {
      groupId: r
    },
    get children() {
      var i = ge(), v = i.firstChild;
      return h(i, z({
        get "data-value"() {
          return e.value;
        },
        get hidden() {
          return !c() || void 0;
        },
        get class() {
          return x("zen-overflow-hidden zen-p-1 zen-text-zen-foreground", "[&_[cmdk-group-heading]]:zen-px-2 [&_[cmdk-group-heading]]:zen-py-1.5 [&_[cmdk-group-heading]]:zen-text-xs [&_[cmdk-group-heading]]:zen-font-semibold [&_[cmdk-group-heading]]:zen-text-zen-muted-fg", e.class, !c() && "zen-hidden");
        }
      }, a), !1, !0), f(i, w(q, {
        get when() {
          return e.heading;
        },
        get children() {
          var u = fe();
          return C(u, "id", s), f(u, () => e.heading), u;
        }
      }), v), f(v, () => e.children), ne(() => C(v, "aria-labelledby", e.heading ? s : void 0)), i;
    }
  });
}, Me = (l) => {
  const [e, a] = b(l, ["alwaysRender", "class"]), t = I();
  return w(q, {
    get when() {
      return e.alwaysRender || !t.search();
    },
    get children() {
      var r = pe();
      return h(r, z({
        get class() {
          return x("-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border", e.class);
        }
      }, a), !1, !1), r;
    }
  });
}, Ae = (l) => {
  const [e, a] = b(l, ["disabled", "onSelect", "value", "keywords", "forceMount", "class", "children"]), t = I(), r = H(J), s = _();
  let c;
  const [i, v] = F("");
  R(() => v(c.textContent?.trim() ?? ""));
  const u = () => e.value ?? i(), p = M(() => {
    if (!t.shouldFilter()) return 1;
    const d = t.search();
    if (!d) return 1;
    const y = u();
    return y ? t.filter()(y, d, e.keywords) : 0;
  }), k = M(() => e.forceMount === !0 || p() > 0);
  P(() => {
    t.setItem(s, {
      value: u(),
      score: p(),
      visible: k(),
      groupId: r?.groupId
    });
  }), le(() => t.removeItem(s));
  const A = () => t.value() === u() && u() !== "", E = () => {
    e.disabled || (t.setValue(u()), e.onSelect?.(u()));
  };
  return (() => {
    var d = ve();
    d.$$pointermove = () => {
      e.disabled || t.disablePointerSelection() || t.setValue(u());
    }, d.$$click = E;
    var y = c;
    return typeof y == "function" ? G(y, d) : c = d, C(d, "id", s), h(d, z({
      get "data-value"() {
        return u();
      },
      get "data-selected"() {
        return A() ? "true" : "false";
      },
      get "data-disabled"() {
        return e.disabled ? "true" : "false";
      },
      get "aria-selected"() {
        return A();
      },
      get "aria-disabled"() {
        return e.disabled ? "true" : void 0;
      },
      get hidden() {
        return !k() || void 0;
      },
      get class() {
        return x("zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none", "data-[selected=true]:zen-bg-zen-muted", "data-[disabled=true]:zen-pointer-events-none data-[disabled=true]:zen-opacity-50", e.class, !k() && "zen-hidden");
      }
    }, a), !1, !0), f(d, () => e.children), d;
  })();
}, be = () => he();
re(["keydown", "input", "click", "pointermove"]);
export {
  we as Command,
  Ie as CommandEmpty,
  Ve as CommandGroup,
  Ce as CommandInput,
  Ae as CommandItem,
  _e as CommandList,
  Se as CommandLoading,
  Me as CommandSeparator,
  ze as defaultFilter
};
//# sourceMappingURL=index95.js.map
