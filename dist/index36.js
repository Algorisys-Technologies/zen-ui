import { jsxs as l, jsx as n } from "react/jsx-runtime";
import * as s from "react";
import { Input as N } from "./index4.js";
import { Select as T, SelectTrigger as O, SelectValue as R, SelectContent as v, SelectItem as y } from "./index35.js";
import { COUNTRY_NAMES as U, COUNTRY_CODES as b } from "./index37.js";
import { cn as E } from "./index143.js";
const _ = Object.entries(
  U
).map(([t, i]) => {
  const r = b[t] ?? "";
  return { dialCode: r ? `+${r}` : "", name: i };
}), j = _.filter((t) => t.dialCode), x = s.forwardRef(
  ({
    value: t,
    defaultValue: i,
    onValueChange: r,
    countries: a = j,
    placeholder: u = "Phone number",
    disabled: d,
    name: p,
    className: C
  }, h) => {
    const f = i ?? t ?? { country: a[0]?.dialCode ?? "+1", number: "" }, [S, g] = s.useState(f), c = t !== void 0, o = c ? t : S, m = (e) => {
      c || g(e), r?.(e);
    };
    return /* @__PURE__ */ l("div", { className: E("zen-flex zen-items-stretch zen-gap-2", C), children: [
      /* @__PURE__ */ n("div", { style: { width: 120 }, children: /* @__PURE__ */ l(
        T,
        {
          value: o.country,
          onValueChange: (e) => m({ ...o, country: e }),
          disabled: d,
          children: [
            /* @__PURE__ */ n(O, { children: /* @__PURE__ */ n(R, {}) }),
            /* @__PURE__ */ n(v, { children: a.map((e, I) => /* @__PURE__ */ l(
              y,
              {
                value: e.dialCode,
                children: [
                  e.dialCode,
                  " — ",
                  e.name
                ]
              },
              `${e.dialCode}-${I}`
            )) })
          ]
        }
      ) }),
      /* @__PURE__ */ n(
        N,
        {
          ref: h,
          type: "tel",
          inputMode: "numeric",
          placeholder: u,
          value: o.number,
          disabled: d,
          name: p,
          onChange: (e) => m({ ...o, number: e.target.value.replace(/[^\d\s-]/g, "") })
        }
      )
    ] });
  }
);
x.displayName = "PhoneInput";
export {
  x as PhoneInput
};
//# sourceMappingURL=index36.js.map
