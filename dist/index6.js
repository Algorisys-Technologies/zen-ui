import { createComponent as i, mergeProps as u, template as z, spread as f, insert as g, effect as v, className as h } from "solid-js/web";
import { splitProps as c, createSignal as p, createMemo as C, createContext as x, useContext as y } from "solid-js";
import { Button as d } from "./index5.js";
import { Icon as P } from "./index21.js";
import { DropdownMenu as S, DropdownMenuTrigger as k, DropdownMenuContent as B } from "./index57.js";
import { cn as m } from "./index103.js";
var w = /* @__PURE__ */ z("<div role=radiogroup>"), I = /* @__PURE__ */ z("<div>");
const T = (t) => {
  const [e, r] = c(t, ["pressed", "defaultPressed", "onPressedChange", "variant", "class", "onClick"]), [a, o] = p(e.defaultPressed ?? !1), n = () => e.pressed ?? a();
  return i(d, u({
    type: "button",
    get variant() {
      return e.variant ?? "outline";
    },
    get "aria-pressed"() {
      return n();
    },
    get class() {
      return m(n() && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border-zen-primary", e.class);
    },
    onClick: (s) => {
      if (e.onClick?.(s), s.defaultPrevented) return;
      const l = !n();
      e.pressed === void 0 && o(l), e.onPressedChange?.(l);
    }
  }, r));
}, b = x(), M = () => {
  const t = y(b);
  if (!t) throw new Error("SegmentedButtonItem must be used inside a SegmentedButton");
  return t;
}, E = (t) => {
  const [e, r] = c(t, ["value", "defaultValue", "onValueChange", "size", "class", "children"]), [a, o] = p(e.defaultValue), n = C(() => e.value ?? a()), s = (l) => {
    e.value === void 0 && o(l), e.onValueChange?.(l);
  };
  return i(b.Provider, {
    value: {
      value: n,
      select: s,
      size: () => e.size ?? "sm"
    },
    get children() {
      var l = w();
      return f(l, u({
        get class() {
          return m("zen-inline-flex zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border", "[&>button]:zen-rounded-none [&>button]:zen-border-0 [&>button:not(:first-child)]:zen-border-l [&>button:not(:first-child)]:zen-border-zen-border", "[&>button:first-child]:zen-rounded-l-zen-md [&>button:last-child]:zen-rounded-r-zen-md", e.class);
        }
      }, r), !1, !0), g(l, () => e.children), l;
    }
  });
}, N = (t) => {
  const e = M(), [r, a] = c(t, ["value", "class", "onClick"]), o = () => e.value() === r.value;
  return i(d, u({
    type: "button",
    role: "radio",
    get "aria-checked"() {
      return o();
    },
    variant: "ghost",
    get size() {
      return e.size();
    },
    get class() {
      return m(o() && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-font-semibold", r.class);
    },
    onClick: (n) => {
      r.onClick?.(n), n.defaultPrevented || e.select(r.value);
    }
  }, a));
}, j = (t) => {
  const [e, r] = c(t, ["menu", "menuLabel", "menuAlign", "variant", "color", "size", "class", "children", "disabled"]), a = () => e.variant ?? "solid", o = () => e.color ?? "primary", n = () => e.size ?? "md";
  return (
    // Two real buttons, not one with a nested trigger: a <button> inside a
    // <button> is invalid HTML and breaks keyboard semantics.
    (() => {
      var s = I();
      return g(s, i(d, u({
        type: "button",
        get variant() {
          return a();
        },
        get color() {
          return o();
        },
        get size() {
          return n();
        },
        get disabled() {
          return e.disabled;
        },
        class: "zen-rounded-r-none"
      }, r, {
        get children() {
          return e.children;
        }
      })), null), g(s, i(S, {
        get children() {
          return [i(k, {
            as: d,
            type: "button",
            get variant() {
              return a();
            },
            get color() {
              return o();
            },
            get size() {
              return n();
            },
            get disabled() {
              return e.disabled;
            },
            get "aria-label"() {
              return e.menuLabel ?? "More actions";
            },
            class: "zen-rounded-l-none zen-border-l zen-border-l-zen-border zen-px-2",
            get children() {
              return i(P, {
                name: "chevron-down",
                size: 14
              });
            }
          }), i(B, {
            get align() {
              return e.menuAlign ?? "end";
            },
            get children() {
              return e.menu;
            }
          })];
        }
      }), null), v(() => h(s, m("zen-inline-flex zen-items-stretch", e.class))), s;
    })()
  );
};
export {
  E as SegmentedButton,
  N as SegmentedButtonItem,
  j as SplitButton,
  T as ToggleButton
};
//# sourceMappingURL=index6.js.map
