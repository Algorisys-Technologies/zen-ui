import { jsxs as i, jsx as n } from "react/jsx-runtime";
import * as s from "react";
import { Input as O } from "./index4.js";
import { Select as R, SelectTrigger as v, SelectValue as y, SelectContent as U, SelectItem as E } from "./index39.js";
import { COUNTRY_NAMES as _, COUNTRY_CODES as b } from "./index41.js";
import { useLocale as j } from "./index90.js";
import { cn as x } from "./index197.js";
const z = Object.entries(
  _
).map(([t, l]) => {
  const o = b[t] ?? "";
  return { dialCode: o ? `+${o}` : "", name: l };
}), L = z.filter((t) => t.dialCode), Y = s.forwardRef(
  ({
    value: t,
    defaultValue: l,
    onValueChange: o,
    countries: a = L,
    placeholder: p,
    disabled: c,
    name: u,
    className: h
  }, C) => {
    const f = j(), S = p ?? f.t("phoneInput.placeholder"), I = l ?? t ?? { country: a[0]?.dialCode ?? "+1", number: "" }, [g, N] = s.useState(I), d = t !== void 0, r = d ? t : g, m = (e) => {
      d || N(e), o?.(e);
    };
    return /* @__PURE__ */ i("div", { className: x("zen-flex zen-items-stretch zen-gap-2", h), children: [
      /* @__PURE__ */ n("div", { style: { width: 120 }, children: /* @__PURE__ */ i(
        R,
        {
          value: r.country,
          onValueChange: (e) => m({ ...r, country: e }),
          disabled: c,
          children: [
            /* @__PURE__ */ n(v, { children: /* @__PURE__ */ n(y, {}) }),
            /* @__PURE__ */ n(U, { children: a.map((e, T) => /* @__PURE__ */ i(
              E,
              {
                value: e.dialCode,
                children: [
                  e.dialCode,
                  " — ",
                  e.name
                ]
              },
              `${e.dialCode}-${T}`
            )) })
          ]
        }
      ) }),
      /* @__PURE__ */ n(
        O,
        {
          ref: C,
          type: "tel",
          inputMode: "numeric",
          placeholder: S,
          value: r.number,
          disabled: c,
          name: u,
          onChange: (e) => m({ ...r, number: e.target.value.replace(/[^\d\s-]/g, "") })
        }
      )
    ] });
  }
);
Y.displayName = "PhoneInput";
export {
  Y as PhoneInput
};
//# sourceMappingURL=index40.js.map
