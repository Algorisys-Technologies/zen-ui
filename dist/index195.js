import * as u from "react";
import { jsx as v } from "react/jsx-runtime";
function P(e, i = []) {
  let n = [];
  function m(c, t) {
    const o = u.createContext(t);
    o.displayName = c + "Context";
    const r = n.length;
    n = [...n, t];
    const x = (p) => {
      const { scope: d, children: C, ...a } = p, S = d?.[e]?.[r] || o, f = u.useMemo(() => a, Object.values(a));
      return /* @__PURE__ */ v(S.Provider, { value: f, children: C });
    };
    x.displayName = c + "Provider";
    function l(p, d, C = {}) {
      const { optional: a = !1 } = C, S = d?.[e]?.[r] || o, f = u.useContext(S);
      if (f) return f;
      if (t !== void 0) return t;
      if (!a)
        throw new Error(`\`${p}\` must be used within \`${c}\``);
    }
    return [x, l];
  }
  const s = () => {
    const c = n.map((t) => u.createContext(t));
    return function(o) {
      const r = o?.[e] || c;
      return u.useMemo(
        () => ({ [`__scope${e}`]: { ...o, [e]: r } }),
        [o, r]
      );
    };
  };
  return s.scopeName = e, [m, _(s, ...i)];
}
function _(...e) {
  const i = e[0];
  if (e.length === 1) return i;
  const n = () => {
    const m = e.map((s) => ({
      useScope: s(),
      scopeName: s.scopeName
    }));
    return function(c) {
      const t = m.reduce((o, { useScope: r, scopeName: x }) => {
        const p = r(c)[`__scope${x}`];
        return { ...o, ...p };
      }, {});
      return u.useMemo(() => ({ [`__scope${i.scopeName}`]: t }), [t]);
    };
  };
  return n.scopeName = i.scopeName, n;
}
export {
  P as createContextScope
};
//# sourceMappingURL=index195.js.map
