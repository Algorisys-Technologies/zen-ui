import * as e from "react";
import { jsx as n } from "react/jsx-runtime";
var o = e.createContext(void 0), a = (r) => {
  const { dir: t, children: i } = r;
  return /* @__PURE__ */ n(o.Provider, { value: t, children: i });
};
function s(r) {
  const t = e.useContext(o);
  return r || t || "ltr";
}
export {
  a as DirectionProvider,
  s as useDirection
};
//# sourceMappingURL=index173.js.map
