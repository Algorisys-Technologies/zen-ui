import { jsx as c } from "react/jsx-runtime";
import * as o from "react";
import { DirectionProvider as n } from "./index238.js";
import "./index199.js";
import { readDocumentDirection as t, observeDocumentDirection as D } from "./index207.js";
import "./index208.js";
import "./index28.js";
import "./index110.js";
const P = ({ dir: e, children: i }) => {
  const [m, r] = o.useState(t);
  return o.useEffect(() => (r(t()), D(r)), []), /* @__PURE__ */ c(n, { dir: e ?? m, children: i });
};
export {
  P as DirectionProvider
};
//# sourceMappingURL=index89.js.map
