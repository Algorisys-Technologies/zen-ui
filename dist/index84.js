import { template as i, insert as s, effect as x, className as h, createComponent as v, Dynamic as $, spread as d, mergeProps as m, setAttribute as F } from "solid-js/web";
import { createUniqueId as _, createContext as p, splitProps as u, Show as C, useContext as b } from "solid-js";
import { cn as c } from "./index106.js";
var f = /* @__PURE__ */ i("<div>"), w = /* @__PURE__ */ i("<label>"), y = /* @__PURE__ */ i("<div data-form-control>"), z = /* @__PURE__ */ i("<p>");
const M = (r) => (() => {
  var e = f();
  return s(e, () => r.children), x(() => h(e, c("zen-space-y-4", r.class))), e;
})(), I = p(null), g = () => {
  const r = b(I);
  if (!r) throw new Error("useFormField / FormLabel / FormControl / FormMessage must be inside <FormField>");
  return r;
};
function q(r) {
  const e = _(), t = `${e}-description`, n = `${e}-message`;
  return v($, {
    get component() {
      return r.Field;
    },
    get name() {
      return r.name;
    },
    children: (o, l) => {
      const a = {
        name: r.name,
        itemId: e,
        descriptionId: t,
        messageId: n,
        error: () => o.error || void 0
      };
      return v(I.Provider, {
        value: a,
        get children() {
          return r.children(o, l);
        }
      });
    }
  });
}
const A = (r) => {
  const [e, t] = u(r, ["class", "children"]);
  return (() => {
    var n = f();
    return d(n, m(t, {
      get class() {
        return c("zen-space-y-1.5", e.class);
      }
    }), !1, !0), s(n, () => e.children), n;
  })();
}, E = (r) => {
  const e = g(), [t, n] = u(r, ["class", "children"]);
  return (
    // `for` is set after `rest` so the field-id wiring always wins over any
    // stray `for` a caller might pass.
    (() => {
      var o = w();
      return d(o, m(n, {
        get for() {
          return e.itemId;
        },
        get class() {
          return c("zen-text-sm zen-font-medium zen-leading-none", e.error() ? "zen-text-zen-error" : "zen-text-zen-foreground", t.class);
        }
      }), !1, !0), s(o, () => t.children), o;
    })()
  );
}, N = (r) => {
  const e = g();
  return (() => {
    var t = y();
    return s(t, () => r.children), x((n) => {
      var o = e.itemId, l = e.error() ? "true" : void 0, a = r.class;
      return o !== n.e && F(t, "data-field-id", n.e = o), l !== n.t && F(t, "data-error", n.t = l), a !== n.a && h(t, n.a = a), n;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    }), t;
  })();
}, S = (r) => {
  const e = g(), [t, n] = u(r, ["class", "children"]);
  return (() => {
    var o = z();
    return d(o, m(n, {
      get id() {
        return e.descriptionId;
      },
      get class() {
        return c("zen-text-xs zen-text-zen-muted-fg", t.class);
      }
    }), !1, !0), s(o, () => t.children), o;
  })();
}, U = (r) => {
  const e = g(), [t, n] = u(r, ["class", "children"]);
  return v(C, {
    get when() {
      return e.error() || t.children;
    },
    get children() {
      var o = z();
      return d(o, m(n, {
        get id() {
          return e.messageId;
        },
        get class() {
          return c("zen-text-xs zen-font-medium zen-text-zen-error", t.class);
        },
        role: "alert"
      }), !1, !0), s(o, () => e.error() || t.children), o;
    }
  });
};
export {
  M as Form,
  N as FormControl,
  S as FormDescription,
  q as FormField,
  A as FormItem,
  E as FormLabel,
  U as FormMessage,
  g as useFormField
};
//# sourceMappingURL=index84.js.map
