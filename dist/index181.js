import { jsx as r, Fragment as z, jsxs as p } from "react/jsx-runtime";
import * as s from "react";
import { Input as b } from "./index4.js";
import { NumberField as g } from "./index10.js";
import { Select as v, SelectTrigger as h, SelectValue as x, SelectContent as y, SelectItem as N } from "./index35.js";
import { cn as D } from "./index143.js";
const f = "zen-flex zen-items-center zen-w-full zen-h-full zen-m-[-0.5rem] zen-p-[0.4rem] zen-bg-zen-background zen-ring-2 zen-ring-zen-ring zen-rounded-zen-sm";
function E({ initialValue: t, onCommit: o, onCancel: u }) {
  const [l, n] = s.useState(String(t ?? "")), a = s.useRef(null);
  return s.useEffect(() => {
    a.current?.focus(), a.current?.select();
  }, []), /* @__PURE__ */ r("div", { className: f, children: /* @__PURE__ */ r(
    b,
    {
      ref: a,
      value: l,
      onChange: (e) => n(e.target.value),
      onKeyDown: (e) => {
        e.key === "Enter" ? (e.preventDefault(), o(l)) : e.key === "Escape" && (e.preventDefault(), u());
      },
      onBlur: () => o(l),
      className: "zen-h-7 zen-text-sm zen-border-0 zen-ring-0 focus-visible:zen-ring-0 zen-px-1"
    }
  ) });
}
function k({ initialValue: t, onCommit: o, onCancel: u }) {
  const l = typeof t == "number" ? t : t === "" || t === null || t === void 0 ? null : Number(t), [n, a] = s.useState(
    Number.isNaN(l) ? null : l
  );
  return /* @__PURE__ */ r(
    "div",
    {
      className: f,
      onKeyDown: (e) => {
        e.key === "Enter" ? (e.preventDefault(), o(n)) : e.key === "Escape" && (e.preventDefault(), u());
      },
      onBlur: (e) => {
        e.currentTarget.contains(e.relatedTarget) || o(n);
      },
      tabIndex: -1,
      children: /* @__PURE__ */ r(
        g,
        {
          value: n ?? void 0,
          onValueChange: a,
          className: "zen-h-7 zen-text-sm zen-border-0 zen-ring-0 focus-visible:zen-ring-0 zen-px-1"
        }
      )
    }
  );
}
function S({
  initialValue: t,
  onCommit: o,
  onCancel: u,
  options: l
}) {
  return /* @__PURE__ */ r(
    "div",
    {
      className: f,
      onKeyDown: (n) => {
        n.key === "Escape" && (n.preventDefault(), u());
      },
      children: /* @__PURE__ */ p(
        v,
        {
          defaultValue: String(t ?? ""),
          onValueChange: (n) => o(n),
          open: !0,
          onOpenChange: (n) => {
            n || u();
          },
          children: [
            /* @__PURE__ */ r(h, { className: "zen-h-7 zen-text-sm", children: /* @__PURE__ */ r(x, {}) }),
            /* @__PURE__ */ r(y, { children: l.map((n) => /* @__PURE__ */ r(N, { value: n.value, children: n.label }, n.value)) })
          ]
        }
      )
    }
  );
}
function B({
  cell: t,
  editing: o,
  onStartEdit: u,
  onCommit: l,
  onCancel: n,
  children: a
}) {
  const e = t.column.columnDef.meta;
  if (!(typeof e?.editable == "function" ? e.editable(t.row.original) : !!e?.editable)) return /* @__PURE__ */ r(z, { children: a });
  if (o) {
    const i = e?.editVariant ?? "text", c = { initialValue: t.getValue(), onCommit: l, onCancel: n };
    switch (i) {
      case "number":
        return /* @__PURE__ */ r(k, { ...c });
      case "select":
        return /* @__PURE__ */ r(S, { ...c, options: e?.editOptions ?? [] });
      default:
        return /* @__PURE__ */ r(E, { ...c });
    }
  }
  const m = t.column.columnDef.header, d = typeof m == "string" ? m : t.column.id;
  return /* @__PURE__ */ r(
    "div",
    {
      onDoubleClick: u,
      onKeyDown: (i) => {
        (i.key === "Enter" || i.key === " ") && (i.preventDefault(), u());
      },
      tabIndex: 0,
      role: "button",
      "aria-label": `Edit ${d}`,
      className: D(
        "zen-w-full zen-h-full zen-inline-flex zen-items-center zen-cursor-text",
        "zen-rounded-zen-sm",
        "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring"
      ),
      children: a
    }
  );
}
export {
  B as EditableCell
};
//# sourceMappingURL=index181.js.map
