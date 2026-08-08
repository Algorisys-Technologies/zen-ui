import * as o from "react";
import * as n from "react-dom";
import { Primitive as f } from "./index203.js";
import { useLayoutEffect as c } from "./index208.js";
import { jsx as u } from "react/jsx-runtime";
var l = "Portal", p = o.forwardRef((r, e) => {
  const { container: a, ...s } = r, [i, m] = o.useState(!1);
  c(() => m(!0), []);
  const t = a || i && globalThis?.document?.body;
  return t ? n.createPortal(/* @__PURE__ */ u(f.div, { ...s, ref: e }), t) : null;
});
p.displayName = l;
export {
  p as Portal
};
//# sourceMappingURL=index201.js.map
