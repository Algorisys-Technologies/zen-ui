import { jsx as i } from "react/jsx-runtime";
import * as n from "react";
import { Root as F } from "./index150.js";
import { FormProvider as u, Controller as x, useFormContext as p } from "./index167.js";
import { cn as a } from "./index143.js";
const R = u, f = n.createContext(
  {}
), h = (e) => /* @__PURE__ */ i(f.Provider, { value: { name: e.name }, children: /* @__PURE__ */ i(x, { ...e }) }), l = n.createContext(
  {}
), I = n.forwardRef(({ className: e, ...o }, r) => {
  const t = n.useId();
  return /* @__PURE__ */ i(l.Provider, { value: { id: t }, children: /* @__PURE__ */ i(
    "div",
    {
      ref: r,
      className: a("zen-space-y-1.5", e),
      ...o
    }
  ) });
});
I.displayName = "FormItem";
const d = () => {
  const e = n.useContext(f), o = n.useContext(l), { getFieldState: r, formState: t } = p();
  if (!e)
    throw new Error("useFormField must be used within <FormField>");
  const m = r(e.name, t), { id: s } = o;
  return {
    id: s,
    name: e.name,
    formItemId: `${s}-form-item`,
    formDescriptionId: `${s}-form-item-description`,
    formMessageId: `${s}-form-item-message`,
    ...m
  };
}, z = n.forwardRef(({ className: e, ...o }, r) => {
  const { error: t, formItemId: m } = d();
  return /* @__PURE__ */ i(
    "label",
    {
      ref: r,
      htmlFor: m,
      className: a(
        "zen-text-sm zen-font-medium zen-leading-none",
        t ? "zen-text-zen-error" : "zen-text-zen-foreground",
        e
      ),
      ...o
    }
  );
});
z.displayName = "FormLabel";
const g = n.forwardRef(({ ...e }, o) => {
  const { error: r, formItemId: t, formDescriptionId: m, formMessageId: s } = d();
  return /* @__PURE__ */ i(
    F,
    {
      ref: o,
      id: t,
      "aria-describedby": r ? `${m} ${s}` : `${m}`,
      "aria-invalid": !!r,
      ...e
    }
  );
});
g.displayName = "FormControl";
const C = n.forwardRef(({ className: e, ...o }, r) => {
  const { formDescriptionId: t } = d();
  return /* @__PURE__ */ i(
    "p",
    {
      ref: r,
      id: t,
      className: a("zen-text-xs zen-text-zen-muted-fg", e),
      ...o
    }
  );
});
C.displayName = "FormDescription";
const N = n.forwardRef(({ className: e, children: o, ...r }, t) => {
  const { error: m, formMessageId: s } = d(), c = m ? String(m?.message ?? "") : o;
  return c ? /* @__PURE__ */ i(
    "p",
    {
      ref: t,
      id: s,
      className: a("zen-text-xs zen-font-medium zen-text-zen-error", e),
      ...r,
      children: c
    }
  ) : null;
});
N.displayName = "FormMessage";
export {
  R as Form,
  g as FormControl,
  C as FormDescription,
  h as FormField,
  I as FormItem,
  z as FormLabel,
  N as FormMessage,
  d as useFormField
};
//# sourceMappingURL=index68.js.map
