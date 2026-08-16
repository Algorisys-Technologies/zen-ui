import { jsx as r, jsxs as f } from "react/jsx-runtime";
import * as y from "react";
import { useFormContext as x, Controller as N } from "./index169.js";
import { Checkbox as B } from "./index33.js";
import { Input as F } from "./index4.js";
import { Textarea as k } from "./index5.js";
import { RadioGroup as I, RadioGroupItem as $ } from "./index34.js";
import { Select as j, SelectTrigger as w, SelectValue as R, SelectContent as V, SelectItem as G } from "./index36.js";
import { Slider as T } from "./index39.js";
import { Switch as A } from "./index35.js";
import { cn as S } from "./index145.js";
const C = ({
  id: e,
  label: o,
  description: t,
  error: n,
  required: l,
  className: a,
  children: d
}) => /* @__PURE__ */ f("div", { className: S("zen-flex zen-flex-col zen-gap-1.5", a), children: [
  o ? /* @__PURE__ */ f(
    "label",
    {
      htmlFor: e,
      className: S(
        "zen-text-sm zen-font-medium zen-leading-none",
        n ? "zen-text-zen-error" : "zen-text-zen-foreground"
      ),
      children: [
        o,
        l ? /* @__PURE__ */ r("span", { "aria-hidden": !0, className: "zen-ml-0.5 zen-text-zen-error", children: "*" }) : null
      ]
    }
  ) : null,
  d,
  t && !n ? /* @__PURE__ */ r("p", { className: "zen-text-xs zen-text-zen-muted-fg", children: t }) : null,
  n ? /* @__PURE__ */ r("p", { className: "zen-text-xs zen-font-medium zen-text-zen-error", role: "alert", children: n }) : null
] }), v = (e, o) => {
  const t = y.useId();
  return `${e}-${t}`;
}, p = (e, o) => {
  const t = o.split(".");
  let n = e;
  for (const a of t)
    if (n && typeof n == "object" && a in n)
      n = n[a];
    else
      return;
  const l = n?.message;
  return typeof l == "string" ? l : void 0;
};
function Q({
  name: e,
  label: o,
  description: t,
  required: n,
  rules: l,
  fieldClassName: a,
  className: d,
  ...m
}) {
  const {
    register: u,
    formState: { errors: s }
  } = x(), c = v(e), i = p(s, e);
  return /* @__PURE__ */ r(
    C,
    {
      id: c,
      label: o,
      description: t,
      required: n,
      error: i,
      className: a,
      children: /* @__PURE__ */ r(
        F,
        {
          id: c,
          "aria-invalid": !!i || void 0,
          "aria-describedby": t || i ? `${c}-msg` : void 0,
          className: d,
          ...u(e, l),
          ...m
        }
      )
    }
  );
}
function U({
  name: e,
  label: o,
  description: t,
  required: n,
  rules: l,
  fieldClassName: a,
  className: d,
  ...m
}) {
  const {
    register: u,
    formState: { errors: s }
  } = x(), c = v(e), i = p(s, e);
  return /* @__PURE__ */ r(
    C,
    {
      id: c,
      label: o,
      description: t,
      required: n,
      error: i,
      className: a,
      children: /* @__PURE__ */ r(
        k,
        {
          id: c,
          "aria-invalid": !!i || void 0,
          className: d,
          ...u(e, l),
          ...m
        }
      )
    }
  );
}
function W({
  name: e,
  options: o,
  label: t,
  description: n,
  required: l,
  rules: a,
  placeholder: d,
  disabled: m,
  fieldClassName: u
}) {
  const { control: s, formState: { errors: c } } = x(), i = v(e), g = p(c, e);
  return /* @__PURE__ */ r(
    N,
    {
      control: s,
      name: e,
      rules: a,
      render: ({ field: h }) => /* @__PURE__ */ r(
        C,
        {
          id: i,
          label: t,
          description: n,
          required: l,
          error: g,
          className: u,
          children: /* @__PURE__ */ f(
            j,
            {
              value: h.value ?? "",
              onValueChange: h.onChange,
              disabled: m,
              children: [
                /* @__PURE__ */ r(w, { id: i, "aria-invalid": !!g || void 0, children: /* @__PURE__ */ r(R, { placeholder: d }) }),
                /* @__PURE__ */ r(V, { children: o.map((z) => /* @__PURE__ */ r(
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
  label: o,
  description: t,
  rules: n,
  disabled: l,
  fieldClassName: a
}) {
  const { control: d, formState: { errors: m } } = x(), u = v(e), s = p(m, e);
  return /* @__PURE__ */ r(
    N,
    {
      control: d,
      name: e,
      rules: n,
      render: ({ field: c }) => /* @__PURE__ */ f("div", { className: S("zen-flex zen-flex-col zen-gap-1.5", a), children: [
        /* @__PURE__ */ f(
          "label",
          {
            htmlFor: u,
            className: "zen-inline-flex zen-items-center zen-gap-2 zen-cursor-pointer zen-text-sm",
            children: [
              /* @__PURE__ */ r(
                B,
                {
                  id: u,
                  checked: c.value,
                  onCheckedChange: (i) => c.onChange(i === !0),
                  disabled: l,
                  "aria-invalid": !!s || void 0
                }
              ),
              /* @__PURE__ */ r("span", { children: o })
            ]
          }
        ),
        t && !s ? /* @__PURE__ */ r("p", { className: "zen-text-xs zen-text-zen-muted-fg zen-pl-6", children: t }) : null,
        s ? /* @__PURE__ */ r("p", { className: "zen-text-xs zen-font-medium zen-text-zen-error zen-pl-6", role: "alert", children: s }) : null
      ] })
    }
  );
}
function Y({
  name: e,
  label: o,
  description: t,
  rules: n,
  disabled: l,
  fieldClassName: a
}) {
  const { control: d, formState: { errors: m } } = x(), u = v(e), s = p(m, e);
  return /* @__PURE__ */ r(
    N,
    {
      control: d,
      name: e,
      rules: n,
      render: ({ field: c }) => /* @__PURE__ */ f("div", { className: S("zen-flex zen-items-center zen-justify-between zen-gap-3", a), children: [
        /* @__PURE__ */ f("div", { children: [
          o ? /* @__PURE__ */ r("label", { htmlFor: u, className: "zen-text-sm zen-font-medium zen-cursor-pointer", children: o }) : null,
          t ? /* @__PURE__ */ r("p", { className: "zen-text-xs zen-text-zen-muted-fg", children: t }) : null,
          s ? /* @__PURE__ */ r("p", { className: "zen-text-xs zen-font-medium zen-text-zen-error", role: "alert", children: s }) : null
        ] }),
        /* @__PURE__ */ r(
          A,
          {
            id: u,
            checked: !!c.value,
            onCheckedChange: c.onChange,
            disabled: l,
            "aria-invalid": !!s || void 0
          }
        )
      ] })
    }
  );
}
function Z({
  name: e,
  options: o,
  label: t,
  description: n,
  required: l,
  rules: a,
  orientation: d = "vertical",
  disabled: m,
  fieldClassName: u
}) {
  const { control: s, formState: { errors: c } } = x(), i = v(e), g = p(c, e);
  return /* @__PURE__ */ r(
    N,
    {
      control: s,
      name: e,
      rules: a,
      render: ({ field: h }) => /* @__PURE__ */ r(
        C,
        {
          id: i,
          label: t,
          description: n,
          required: l,
          error: g,
          className: u,
          children: /* @__PURE__ */ r(
            I,
            {
              value: h.value ?? "",
              onValueChange: h.onChange,
              disabled: m,
              style: d === "horizontal" ? { display: "flex", flexDirection: "row", gap: "var(--zen-space-3)" } : void 0,
              children: o.map((z) => {
                const b = `${i}-${z.value}`;
                return /* @__PURE__ */ f(
                  "label",
                  {
                    htmlFor: b,
                    className: "zen-inline-flex zen-items-center zen-gap-2 zen-cursor-pointer zen-text-sm",
                    children: [
                      /* @__PURE__ */ r(
                        $,
                        {
                          id: b,
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
  label: o,
  description: t,
  rules: n,
  min: l = 0,
  max: a = 100,
  step: d = 1,
  disabled: m,
  fieldClassName: u
}) {
  const { control: s, formState: { errors: c } } = x(), i = v(e), g = p(c, e);
  return /* @__PURE__ */ r(
    N,
    {
      control: s,
      name: e,
      rules: n,
      render: ({ field: h }) => {
        const z = Array.isArray(h.value) ? h.value : [Number(h.value ?? l)];
        return /* @__PURE__ */ r(
          C,
          {
            id: i,
            label: o,
            description: t,
            error: g,
            className: u,
            children: /* @__PURE__ */ r(
              T,
              {
                value: z,
                onValueChange: h.onChange,
                min: l,
                max: a,
                step: d,
                disabled: m
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
//# sourceMappingURL=index70.js.map
