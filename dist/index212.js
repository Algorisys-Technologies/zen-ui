import { jsx as r, Fragment as h, jsxs as x } from "react/jsx-runtime";
import * as f from "react";
import { Input as N } from "./index4.js";
import { NumberField as y } from "./index11.js";
import { Select as D, SelectTrigger as E, SelectValue as k, SelectContent as C, SelectItem as w } from "./index39.js";
import { useLocale as S } from "./index90.js";
import { cn as R } from "./index160.js";
const z = "zen-flex zen-items-center zen-w-full zen-h-full zen-m-[-0.5rem] zen-p-[0.4rem] zen-bg-zen-background zen-ring-2 zen-ring-zen-ring zen-rounded-zen-sm";
function p(n, i) {
  const l = f.useRef(!1);
  return {
    commit: (s) => {
      l.current || (l.current = !0, n(s));
    },
    cancel: () => {
      l.current || (l.current = !0, i());
    }
  };
}
function T({ initialValue: n, seeded: i, onCommit: l, onCancel: s }) {
  const [u, e] = f.useState(String(n ?? "")), m = f.useRef(null), o = p(l, s);
  return f.useEffect(() => {
    const t = m.current;
    t?.focus(), i ? t?.setSelectionRange(t.value.length, t.value.length) : t?.select();
  }, []), /* @__PURE__ */ r("div", { className: z, children: /* @__PURE__ */ r(
    N,
    {
      ref: m,
      value: u,
      onChange: (t) => e(t.target.value),
      onKeyDown: (t) => {
        t.key === "Enter" ? (t.preventDefault(), o.commit(u)) : t.key === "Escape" && (t.preventDefault(), o.cancel());
      },
      onBlur: () => o.commit(u),
      className: "zen-h-7 zen-text-sm zen-border-0 zen-ring-0 focus-visible:zen-ring-0 zen-px-1"
    }
  ) });
}
function I({ initialValue: n, seeded: i, onCommit: l, onCancel: s }) {
  const u = typeof n == "number" ? n : n === "" || n === null || n === void 0 ? null : Number(n), [e, m] = f.useState(
    Number.isNaN(u) ? null : u
  ), o = p(l, s), t = f.useRef(null);
  return f.useEffect(() => {
    t.current?.focus(), i || t.current?.select();
  }, []), /* @__PURE__ */ r(
    "div",
    {
      className: z,
      onKeyDown: (c) => {
        c.key === "Enter" ? (c.preventDefault(), o.commit(e)) : c.key === "Escape" && (c.preventDefault(), o.cancel());
      },
      onBlur: (c) => {
        c.currentTarget.contains(c.relatedTarget) || o.commit(e);
      },
      tabIndex: -1,
      children: /* @__PURE__ */ r(
        y,
        {
          ref: t,
          value: e ?? void 0,
          onValueChange: m,
          className: "zen-h-7 zen-text-sm zen-border-0 zen-ring-0 focus-visible:zen-ring-0 zen-px-1"
        }
      )
    }
  );
}
function K({
  initialValue: n,
  onCommit: i,
  onCancel: l,
  options: s
}) {
  const u = p(i, l);
  return /* @__PURE__ */ r(
    "div",
    {
      className: z,
      onKeyDown: (e) => {
        e.key === "Escape" && (e.preventDefault(), u.cancel());
      },
      children: /* @__PURE__ */ x(
        D,
        {
          value: String(n ?? ""),
          onValueChange: (e) => u.commit(e),
          open: !0,
          onOpenChange: (e) => {
            e || u.cancel();
          },
          children: [
            /* @__PURE__ */ r(E, { className: "zen-h-7 zen-text-sm", children: /* @__PURE__ */ r(k, {}) }),
            /* @__PURE__ */ r(C, { children: s.map((e) => /* @__PURE__ */ r(w, { value: e.value, children: e.label }, e.value)) })
          ]
        }
      )
    }
  );
}
function $({
  cell: n,
  editing: i,
  onStartEdit: l,
  onCommit: s,
  onCancel: u,
  children: e,
  navigable: m,
  seed: o
}) {
  const t = S(), c = n.column.columnDef.meta;
  if (!(typeof c?.editable == "function" ? c.editable(n.row.original) : !!c?.editable)) return /* @__PURE__ */ r(h, { children: e });
  if (i) {
    const a = c?.editVariant ?? "text", g = n.getValue(), d = {
      initialValue: o === void 0 || a === "select" ? g : a === "number" ? /^[0-9]$/.test(o) ? Number(o) : null : o,
      seeded: o !== void 0 && a !== "select",
      onCommit: s,
      onCancel: u
    };
    switch (a) {
      case "number":
        return /* @__PURE__ */ r(I, { ...d });
      case "select":
        return /* @__PURE__ */ r(K, { ...d, options: c?.editOptions ?? [] });
      default:
        return /* @__PURE__ */ r(T, { ...d });
    }
  }
  if (m)
    return /* @__PURE__ */ r(
      "div",
      {
        onDoubleClick: l,
        className: "zen-w-full zen-h-full zen-inline-flex zen-items-center zen-cursor-text",
        children: e
      }
    );
  const v = n.column.columnDef.header, b = typeof v == "string" ? v : n.column.id;
  return /* @__PURE__ */ r(
    "div",
    {
      onDoubleClick: l,
      onKeyDown: (a) => {
        (a.key === "Enter" || a.key === " ") && (a.preventDefault(), l());
      },
      tabIndex: 0,
      role: "button",
      "aria-label": t.t("dataTable.editCell", { column: b }),
      className: R(
        "zen-w-full zen-h-full zen-inline-flex zen-items-center zen-cursor-text",
        "zen-rounded-zen-sm",
        "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring"
      ),
      children: e
    }
  );
}
export {
  $ as EditableCell
};
//# sourceMappingURL=index212.js.map
