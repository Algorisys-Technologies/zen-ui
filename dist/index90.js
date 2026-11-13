import { jsx as d } from "react/jsx-runtime";
import * as r from "react";
import { formatMessage as f, DEFAULT_MESSAGES as l } from "./index236.js";
const c = r.createContext(void 0), E = ({ locale: t, currency: e, messages: u, children: m }) => {
  const o = r.useContext(c), v = r.useMemo(() => {
    const i = t ?? o?.locale;
    return {
      locale: i,
      currency: e ?? o?.currency,
      t: (n, s) => {
        const a = u?.[n];
        return a === void 0 && o ? o.t(n, s) : f(a ?? l[n], s, i);
      }
    };
  }, [t, e, u, o]);
  return /* @__PURE__ */ d(c.Provider, { value: v, children: m });
}, x = {
  locale: void 0,
  currency: void 0,
  t: (t, e) => f(l[t], e)
};
function L() {
  return r.useContext(c) ?? x;
}
export {
  E as LocaleProvider,
  L as useLocale
};
//# sourceMappingURL=index90.js.map
