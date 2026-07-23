import { template as g, insert as d, createComponent as c, effect as b, className as h } from "solid-js/web";
import { splitProps as _, createMemo as a, createSignal as S } from "solid-js";
import { Input as T } from "./index61.js";
import { Select as $ } from "./index58.js";
import { COUNTRY_NAMES as y, COUNTRY_CODES as I } from "./index106.js";
import { cn as N } from "./index103.js";
var O = /* @__PURE__ */ g("<div><div style=width:100px></div><div class=zen-flex-1>");
const U = Object.entries(y).map(([n, e]) => {
  const r = I[n] ?? "";
  return {
    dialCode: r ? `+${r}` : "",
    name: e
  };
}), x = U.filter((n) => n.dialCode), Y = (n) => {
  const [e] = _(n, ["value", "defaultValue", "onValueChange", "countries", "placeholder", "disabled", "name", "class"]), r = a(() => e.countries ?? x), p = () => e.defaultValue ?? e.value ?? {
    country: r()[0]?.dialCode ?? "+1",
    number: ""
  }, i = () => e.value !== void 0, [m, C] = S(p()), o = a(() => i() ? e.value : m()), u = (t) => {
    i() || C(t), e.onValueChange?.(t);
  }, f = a(() => r().map((t) => ({
    value: t.dialCode,
    label: `${t.dialCode} — ${t.name}`
  })));
  return (() => {
    var t = O(), s = t.firstChild, v = s.nextSibling;
    return d(s, c($, {
      get options() {
        return f();
      },
      get value() {
        return o().country;
      },
      onChange: (l) => u({
        ...o(),
        country: l ?? o().country
      }),
      get disabled() {
        return e.disabled;
      }
    })), d(v, c(T, {
      type: "tel",
      inputMode: "tel",
      get placeholder() {
        return e.placeholder ?? "Phone number";
      },
      get value() {
        return o().number;
      },
      onInput: (l) => u({
        ...o(),
        number: l.currentTarget.value
      }),
      get disabled() {
        return e.disabled;
      },
      get name() {
        return e.name;
      }
    })), b(() => h(t, N("zen-flex zen-items-stretch zen-gap-2", e.class))), t;
  })();
};
export {
  I as COUNTRY_CODES,
  y as COUNTRY_NAMES,
  Y as PhoneInput
};
//# sourceMappingURL=index67.js.map
