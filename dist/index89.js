import { jsx as c } from "react/jsx-runtime";
import * as o from "react";
import { DirectionProvider as n } from "./index235.js";
import "./index197.js";
import { readDocumentDirection as t, observeDocumentDirection as D } from "./index205.js";
import "./index28.js";
import "./index110.js";
const v = ({ dir: e, children: i }) => {
  const [m, r] = o.useState(t);
  return o.useEffect(() => (r(t()), D(r)), []), /* @__PURE__ */ c(n, { dir: e ?? m, children: i });
};
export {
  v as DirectionProvider
};
//# sourceMappingURL=index89.js.map
