import { template as S, use as M, spread as w, mergeProps as z, insert as v, createComponent as a, effect as h, style as O, setAttribute as q } from "solid-js/web";
import { isSameSelection as I } from "./index186.js";
import { useFormControlContext as K } from "./index158.js";
import { callHandler as R, visuallyHiddenStyles as F } from "./index163.js";
import { splitProps as H, createSignal as V, createEffect as D, on as L, Show as p, For as b } from "solid-js";
import { mergeRefs as P } from "./index166.js";
var T = /* @__PURE__ */ S("<option>"), _ = /* @__PURE__ */ S("<div aria-hidden=true><input type=text style=font-size:16px><select tabindex=-1><option>");
function N(y) {
  let o;
  const [t, C] = H(y, ["ref", "onChange", "collection", "selectionManager", "isOpen", "isMultiple", "isVirtualized", "focusTrigger"]), l = K(), [x, s] = V(!1), c = (i) => {
    const r = t.collection.getItem(i);
    return a(p, {
      get when() {
        return r?.type === "item";
      },
      get children() {
        var n = T();
        return n.value = i, v(n, () => r?.textValue), h(() => n.selected = t.selectionManager.isSelected(i)), n;
      }
    });
  };
  return D(L(() => t.selectionManager.selectedKeys(), (i, r) => {
    r && I(i, r) || (s(!0), o?.dispatchEvent(new Event("input", {
      bubbles: !0,
      cancelable: !0
    })), o?.dispatchEvent(new Event("change", {
      bubbles: !0,
      cancelable: !0
    })));
  }, {
    defer: !0
  })), (() => {
    var i = _(), r = i.firstChild, n = r.nextSibling;
    n.firstChild, r.addEventListener("focus", () => t.focusTrigger()), n.addEventListener("change", (e) => {
      R(e, t.onChange), x() || t.selectionManager.setSelectedKeys(/* @__PURE__ */ new Set([e.target.value])), s(!1);
    });
    var u = P((e) => o = e, t.ref);
    return typeof u == "function" && M(u, n), w(n, z({
      get multiple() {
        return t.isMultiple;
      },
      get name() {
        return l.name();
      },
      get required() {
        return l.isRequired();
      },
      get disabled() {
        return l.isDisabled();
      },
      get size() {
        return t.collection.getSize();
      },
      get value() {
        return t.selectionManager.firstSelectedKey() ?? "";
      }
    }, C), !1, !0), v(n, a(p, {
      get when() {
        return t.isVirtualized;
      },
      get fallback() {
        return a(b, {
          get each() {
            return [...t.collection.getKeys()];
          },
          children: c
        });
      },
      get children() {
        return a(b, {
          get each() {
            return [...t.selectionManager.selectedKeys()];
          },
          children: c
        });
      }
    }), null), h((e) => {
      var E = F, d = t.selectionManager.isFocused() || t.isOpen ? -1 : 0, g = l.isRequired(), f = l.isDisabled(), m = l.isReadOnly();
      return e.e = O(i, E, e.e), d !== e.t && q(r, "tabindex", e.t = d), g !== e.a && (r.required = e.a = g), f !== e.o && (r.disabled = e.o = f), m !== e.i && (r.readOnly = e.i = m), e;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0
    }), i;
  })();
}
export {
  N as HiddenSelectBase
};
//# sourceMappingURL=index199.js.map
