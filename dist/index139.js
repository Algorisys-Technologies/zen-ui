import { createComponent as u, mergeProps as z, template as c, addEventListener as g, insert as o, effect as s, setAttribute as v, className as b, memo as h, delegateEvents as k } from "solid-js/web";
import { Show as m, createSignal as f, onMount as C } from "solid-js";
import { Input as y } from "./index61.js";
import { NumberField as E } from "./index65.js";
import { Select as V } from "./index58.js";
import { cn as x } from "./index103.js";
var d = /* @__PURE__ */ c('<div class="zen-flex zen-items-center zen-w-full zen-h-full zen-m-[-0.5rem] zen-p-[0.4rem] zen-bg-zen-background zen-ring-2 zen-ring-zen-ring zen-rounded-zen-sm">'), $ = /* @__PURE__ */ c('<div class="zen-flex zen-items-center zen-w-full zen-h-full zen-m-[-0.5rem] zen-p-[0.4rem] zen-bg-zen-background zen-ring-2 zen-ring-zen-ring zen-rounded-zen-sm"tabindex=-1>'), w = /* @__PURE__ */ c("<div tabindex=0 role=button>");
function D(e) {
  const [i, r] = f(String(e.initialValue ?? ""));
  let t;
  return C(() => {
    t?.focus(), t?.select();
  }), (() => {
    var l = d();
    return o(l, u(y, {
      ref(n) {
        var a = t;
        typeof a == "function" ? a(n) : t = n;
      },
      get value() {
        return i();
      },
      onInput: (n) => r(n.currentTarget.value),
      onKeyDown: (n) => {
        n.key === "Enter" ? (n.preventDefault(), e.onCommit(i())) : n.key === "Escape" && (n.preventDefault(), e.onCancel());
      },
      onBlur: () => e.onCommit(i()),
      class: "zen-h-7 zen-text-sm zen-border-0 zen-ring-0 focus-visible:zen-ring-0 zen-px-1"
    })), l;
  })();
}
function S(e) {
  const i = typeof e.initialValue == "number" ? e.initialValue : e.initialValue === "" || e.initialValue === null || e.initialValue === void 0 ? null : Number(e.initialValue), [r, t] = f(Number.isNaN(i) ? null : i);
  return (() => {
    var l = $();
    return l.$$focusout = (n) => {
      n.currentTarget.contains(n.relatedTarget) || e.onCommit(r());
    }, l.$$keydown = (n) => {
      n.key === "Enter" ? (n.preventDefault(), e.onCommit(r())) : n.key === "Escape" && (n.preventDefault(), e.onCancel());
    }, o(l, u(E, {
      get value() {
        return r() ?? void 0;
      },
      onValueChange: t,
      class: "zen-h-7 zen-text-sm zen-border-0 zen-ring-0 focus-visible:zen-ring-0 zen-px-1"
    })), l;
  })();
}
function N(e) {
  return (() => {
    var i = d();
    return i.$$keydown = (r) => {
      r.key === "Escape" && (r.preventDefault(), e.onCancel());
    }, o(i, u(V, {
      get options() {
        return e.options;
      },
      get defaultValue() {
        return String(e.initialValue ?? "");
      },
      onChange: (r) => r ? e.onCommit(r) : e.onCancel()
    })), i;
  })();
}
function F(e) {
  const i = () => e.cell.column.columnDef.meta, r = () => {
    const t = i();
    return t ? typeof t.editable == "function" ? t.editable(e.cell.row.original) : !!t.editable : !1;
  };
  return u(m, {
    get when() {
      return r();
    },
    get fallback() {
      return h(() => e.children);
    },
    get children() {
      return u(m, {
        get when() {
          return e.editing;
        },
        get fallback() {
          return (() => {
            var t = w();
            return t.$$keydown = (l) => {
              (l.key === "Enter" || l.key === " ") && (l.preventDefault(), e.onStartEdit());
            }, g(t, "dblclick", e.onStartEdit, !0), o(t, () => e.children), s((l) => {
              var n = `Edit ${typeof e.cell.column.columnDef.header == "string" ? e.cell.column.columnDef.header : e.cell.column.id}`, a = x("zen-w-full zen-h-full zen-inline-flex zen-items-center zen-cursor-text", "zen-rounded-zen-sm", "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring");
              return n !== l.e && v(t, "aria-label", l.e = n), a !== l.t && b(t, l.t = a), l;
            }, {
              e: void 0,
              t: void 0
            }), t;
          })();
        },
        get children() {
          return (() => {
            const t = i()?.editVariant ?? "text", n = {
              initialValue: e.cell.getValue(),
              onCommit: e.onCommit,
              onCancel: e.onCancel
            };
            switch (t) {
              case "number":
                return u(S, n);
              case "select":
                return u(N, z(n, {
                  get options() {
                    return i()?.editOptions ?? [];
                  }
                }));
              default:
                return u(D, n);
            }
          })();
        }
      });
    }
  });
}
k(["keydown", "focusout", "dblclick"]);
export {
  F as EditableCell
};
//# sourceMappingURL=index139.js.map
