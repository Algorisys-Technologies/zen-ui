import { createComponent as r, template as a, insert as l, effect as u, className as z, setAttribute as v, delegateEvents as f } from "solid-js/web";
import { Show as c, For as b } from "solid-js";
import { Input as x } from "./index64.js";
import { Checkbox as $ } from "./index49.js";
import { Icon as s } from "./index21.js";
import { cn as o } from "./index106.js";
var _ = /* @__PURE__ */ a("<div>"), k = /* @__PURE__ */ a('<ul class="zen-m-0 zen-flex zen-list-none zen-flex-col zen-p-0">'), w = /* @__PURE__ */ a('<p class="zen-m-0 zen-px-4 zen-py-8 zen-text-center zen-text-sm zen-text-zen-muted-fg">'), y = /* @__PURE__ */ a("<li>"), S = /* @__PURE__ */ a('<span class="zen-truncate zen-text-xs zen-text-zen-muted-fg">'), C = /* @__PURE__ */ a('<span class="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col"><span class="zen-truncate zen-text-sm">'), T = /* @__PURE__ */ a('<span class="zen-shrink-0 zen-text-xs zen-text-zen-muted-fg">'), R = /* @__PURE__ */ a("<button type=button>"), I = /* @__PURE__ */ a("<label>");
const O = (e) => {
  const n = () => e.placeholder ?? "Search";
  return (() => {
    var t = _();
    return l(t, r(s, {
      name: "search",
      size: 14,
      class: "zen-pointer-events-none zen-absolute zen-start-3 zen-top-1/2 -zen-translate-y-1/2 zen-text-zen-muted-fg"
    }), null), l(t, r(x, {
      get value() {
        return e.value;
      },
      onInput: (i) => e.onValueChange(i.currentTarget.value),
      get placeholder() {
        return n();
      },
      get "aria-label"() {
        return n();
      },
      class: "zen-ps-9"
    }), null), u(() => z(t, o("zen-relative", e.class))), t;
  })();
}, V = (e) => r(c, {
  get when() {
    return e.items.length > 0;
  },
  get fallback() {
    return (() => {
      var n = w();
      return l(n, () => e.emptyText ?? "No matching items"), n;
    })();
  },
  get children() {
    var n = k();
    return l(n, r(b, {
      get each() {
        return e.items;
      },
      children: (t) => (() => {
        var i = y();
        return l(i, r(c, {
          get when() {
            return e.multiple;
          },
          get fallback() {
            return r(P, {
              item: t,
              get current() {
                return e.selected.includes(t.id);
              },
              onPick: () => e.onPick(t.id)
            });
          },
          get children() {
            return r(A, {
              item: t,
              get checked() {
                return e.selected.includes(t.id);
              },
              onToggle: () => e.onToggle(t.id)
            });
          }
        })), i;
      })()
    })), n;
  }
}), g = "zen-flex zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-sm zen-px-4 zen-py-2.5 zen-text-start", h = (e) => [r(c, {
  get when() {
    return e.item.icon;
  },
  children: (n) => r(s, {
    get name() {
      return n();
    },
    size: 16,
    class: "zen-shrink-0 zen-text-zen-muted-fg"
  })
}), (() => {
  var n = C(), t = n.firstChild;
  return l(t, () => e.item.label), l(n, r(c, {
    get when() {
      return e.item.description;
    },
    get children() {
      var i = S();
      return l(i, () => e.item.description), i;
    }
  }), null), n;
})(), r(c, {
  get when() {
    return e.item.info;
  },
  get children() {
    var n = T();
    return l(n, () => e.item.info), n;
  }
})], P = (e) => (() => {
  var n = R();
  return n.$$click = () => e.onPick(), l(n, r(h, {
    get item() {
      return e.item;
    }
  }), null), l(n, r(c, {
    get when() {
      return e.current;
    },
    get children() {
      return r(s, {
        name: "check",
        size: 16,
        class: "zen-shrink-0 zen-text-zen-primary"
      });
    }
  }), null), u((t) => {
    var i = e.item.disabled, d = e.current || void 0, m = o(g, "zen-border-0 zen-bg-transparent zen-cursor-pointer", "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", "disabled:zen-cursor-not-allowed disabled:zen-opacity-50", e.current && "zen-bg-zen-muted");
    return i !== t.e && (n.disabled = t.e = i), d !== t.t && v(n, "aria-current", t.t = d), m !== t.a && z(n, t.a = m), t;
  }, {
    e: void 0,
    t: void 0,
    a: void 0
  }), n;
})(), A = (e) => (() => {
  var n = I();
  return l(n, r($, {
    get checked() {
      return e.checked;
    },
    get disabled() {
      return e.item.disabled;
    },
    onChange: () => e.onToggle()
  }), null), l(n, r(h, {
    get item() {
      return e.item;
    }
  }), null), u(() => z(n, o(g, "zen-cursor-pointer hover:zen-bg-zen-muted", e.item.disabled && "zen-cursor-not-allowed zen-opacity-50"))), n;
})();
f(["click"]);
export {
  V as SelectListBody,
  O as SelectSearchField
};
//# sourceMappingURL=index116.js.map
