import { jsx as r, jsxs as f } from "react/jsx-runtime";
import * as y from "react";
import { useFormContext as x, Controller as N } from "./index231.js";
import { Checkbox as B } from "./index36.js";
import { Input as F } from "./index4.js";
import { Textarea as k } from "./index5.js";
import { RadioGroup as I, RadioGroupItem as $ } from "./index37.js";
import { Select as j, SelectTrigger as w, SelectValue as R, SelectContent as V, SelectItem as G } from "./index39.js";
import { Slider as T } from "./index42.js";
import { Switch as A } from "./index38.js";
import { cn as C } from "./index197.js";
const b = ({
  id: e,
  labelId: l,
  label: n,
  description: t,
  error: o,
  required: a,
  className: d,
  children: u
}) => /* @__PURE__ */ f("div", { className: C("zen-flex zen-flex-col zen-gap-1.5", d), children: [
  n ? /* @__PURE__ */ f(
    "label",
    {
      htmlFor: l ? void 0 : e,
      id: l,
      className: C(
        "zen-text-sm zen-font-medium zen-leading-none",
        o ? "zen-text-zen-error" : "zen-text-zen-foreground"
      ),
      children: [
        n,
        a ? /* @__PURE__ */ r("span", { "aria-hidden": !0, className: "zen-ml-0.5 zen-text-zen-error", children: "*" }) : null
      ]
    }
  ) : null,
  u,
  t && !o ? /* @__PURE__ */ r("p", { className: "zen-text-xs zen-text-zen-muted-fg", children: t }) : null,
  o ? /* @__PURE__ */ r("p", { className: "zen-text-xs zen-font-medium zen-text-zen-error", role: "alert", children: o }) : null
] }), v = (e, l) => {
  const n = y.useId();
  return `${e}-${n}`;
}, p = (e, l) => {
  const n = l.split(".");
  let t = e;
  for (const a of n)
    if (t && typeof t == "object" && a in t)
      t = t[a];
    else
      return;
  const o = t?.message;
  return typeof o == "string" ? o : void 0;
};
function Q({
  name: e,
  label: l,
  description: n,
  required: t,
  rules: o,
  fieldClassName: a,
  className: d,
  ...u
}) {
  const {
    register: m,
    formState: { errors: i }
  } = x(), s = v(e), c = p(i, e);
  return /* @__PURE__ */ r(
    b,
    {
      id: s,
      label: l,
      description: n,
      required: t,
      error: c,
      className: a,
      children: /* @__PURE__ */ r(
        F,
        {
          id: s,
          "aria-invalid": !!c || void 0,
          "aria-describedby": n || c ? `${s}-msg` : void 0,
          className: d,
          ...m(e, o),
          ...u
        }
      )
    }
  );
}
function U({
  name: e,
  label: l,
  description: n,
  required: t,
  rules: o,
  fieldClassName: a,
  className: d,
  ...u
}) {
  const {
    register: m,
    formState: { errors: i }
  } = x(), s = v(e), c = p(i, e);
  return /* @__PURE__ */ r(
    b,
    {
      id: s,
      label: l,
      description: n,
      required: t,
      error: c,
      className: a,
      children: /* @__PURE__ */ r(
        k,
        {
          id: s,
          "aria-invalid": !!c || void 0,
          className: d,
          ...m(e, o),
          ...u
        }
      )
    }
  );
}
function W({
  name: e,
  options: l,
  label: n,
  description: t,
  required: o,
  rules: a,
  placeholder: d,
  disabled: u,
  fieldClassName: m
}) {
  const { control: i, formState: { errors: s } } = x(), c = v(e), g = p(s, e);
  return /* @__PURE__ */ r(
    N,
    {
      control: i,
      name: e,
      rules: a,
      render: ({ field: h }) => /* @__PURE__ */ r(
        b,
        {
          id: c,
          label: n,
          description: t,
          required: o,
          error: g,
          className: m,
          children: /* @__PURE__ */ f(
            j,
            {
              value: h.value ?? "",
              onValueChange: h.onChange,
              disabled: u,
              children: [
                /* @__PURE__ */ r(w, { id: c, "aria-invalid": !!g || void 0, children: /* @__PURE__ */ r(R, { placeholder: d }) }),
                /* @__PURE__ */ r(V, { children: l.map((z) => /* @__PURE__ */ r(
                  G,
                  {
                    value: z.value,
                    disabled: z.disabled,
                    children: z.label
                  },
                  z.value
                )) })
              ]
            }
          )
        }
      )
    }
  );
}
function X({
  name: e,
  label: l,
  description: n,
  rules: t,
  disabled: o,
  fieldClassName: a
}) {
  const { control: d, formState: { errors: u } } = x(), m = v(e), i = p(u, e);
  return /* @__PURE__ */ r(
    N,
    {
      control: d,
      name: e,
      rules: t,
      render: ({ field: s }) => /* @__PURE__ */ f("div", { className: C("zen-flex zen-flex-col zen-gap-1.5", a), children: [
        /* @__PURE__ */ f(
          "label",
          {
            htmlFor: m,
            className: "zen-inline-flex zen-items-center zen-gap-2 zen-cursor-pointer zen-text-sm",
            children: [
              /* @__PURE__ */ r(
                B,
                {
                  id: m,
                  checked: s.value,
                  onCheckedChange: (c) => s.onChange(c === !0),
                  disabled: o,
                  "aria-invalid": !!i || void 0
                }
              ),
              /* @__PURE__ */ r("span", { children: l })
            ]
          }
        ),
        n && !i ? /* @__PURE__ */ r("p", { className: "zen-text-xs zen-text-zen-muted-fg zen-pl-6", children: n }) : null,
        i ? /* @__PURE__ */ r("p", { className: "zen-text-xs zen-font-medium zen-text-zen-error zen-pl-6", role: "alert", children: i }) : null
      ] })
    }
  );
}
function Y({
  name: e,
  label: l,
  description: n,
  rules: t,
  disabled: o,
  fieldClassName: a
}) {
  const { control: d, formState: { errors: u } } = x(), m = v(e), i = p(u, e);
  return /* @__PURE__ */ r(
    N,
    {
      control: d,
      name: e,
      rules: t,
      render: ({ field: s }) => /* @__PURE__ */ f("div", { className: C("zen-flex zen-items-center zen-justify-between zen-gap-3", a), children: [
        /* @__PURE__ */ f("div", { children: [
          l ? /* @__PURE__ */ r("label", { htmlFor: m, className: "zen-text-sm zen-font-medium zen-cursor-pointer", children: l }) : null,
          n ? /* @__PURE__ */ r("p", { className: "zen-text-xs zen-text-zen-muted-fg", children: n }) : null,
          i ? /* @__PURE__ */ r("p", { className: "zen-text-xs zen-font-medium zen-text-zen-error", role: "alert", children: i }) : null
        ] }),
        /* @__PURE__ */ r(
          A,
          {
            id: m,
            checked: !!s.value,
            onCheckedChange: s.onChange,
            disabled: o,
            "aria-invalid": !!i || void 0
          }
        )
      ] })
    }
  );
}
function Z({
  name: e,
  options: l,
  label: n,
  description: t,
  required: o,
  rules: a,
  orientation: d = "vertical",
  disabled: u,
  fieldClassName: m
}) {
  const { control: i, formState: { errors: s } } = x(), c = v(e), g = p(s, e);
  return /* @__PURE__ */ r(
    N,
    {
      control: i,
      name: e,
      rules: a,
      render: ({ field: h }) => /* @__PURE__ */ r(
        b,
        {
          id: c,
          labelId: `${c}-label`,
          label: n,
          description: t,
          required: o,
          error: g,
          className: m,
          children: /* @__PURE__ */ r(
            I,
            {
              "aria-labelledby": n ? `${c}-label` : void 0,
              value: h.value ?? "",
              onValueChange: h.onChange,
              disabled: u,
              style: d === "horizontal" ? { display: "flex", flexDirection: "row", gap: "var(--zen-space-3)" } : void 0,
              children: l.map((z) => {
                const S = `${c}-${z.value}`;
                return /* @__PURE__ */ f(
                  "label",
                  {
                    htmlFor: S,
                    className: "zen-inline-flex zen-items-center zen-gap-2 zen-cursor-pointer zen-text-sm",
                    children: [
                      /* @__PURE__ */ r(
                        $,
                        {
                          id: S,
                          value: z.value,
                          disabled: z.disabled
                        }
                      ),
                      /* @__PURE__ */ r("span", { children: z.label })
                    ]
                  },
                  z.value
                );
              })
            }
          )
        }
      )
    }
  );
}
function _({
  name: e,
  label: l,
  description: n,
  rules: t,
  min: o = 0,
  max: a = 100,
  step: d = 1,
  disabled: u,
  fieldClassName: m
}) {
  const { control: i, formState: { errors: s } } = x(), c = v(e), g = p(s, e);
  return /* @__PURE__ */ r(
    N,
    {
      control: i,
      name: e,
      rules: t,
      render: ({ field: h }) => {
        const z = Array.isArray(h.value) ? h.value : [Number(h.value ?? o)];
        return /* @__PURE__ */ r(
          b,
          {
            id: c,
            label: l,
            description: n,
            error: g,
            className: m,
            children: /* @__PURE__ */ r(
              T,
              {
                value: z,
                onValueChange: h.onChange,
                min: o,
                max: a,
                step: d,
                disabled: u
              }
            )
          }
        );
      }
    }
  );
}
export {
  X as BoundCheckbox,
  Q as BoundInput,
  Z as BoundRadioGroup,
  W as BoundSelect,
  _ as BoundSlider,
  Y as BoundSwitch,
  U as BoundTextarea
};
//# sourceMappingURL=index78.js.map
