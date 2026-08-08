import { jsx as c } from "react/jsx-runtime";
import * as o from "react";
import { DirectionProvider as n } from "./index171.js";
import "./index143.js";
import { readDocumentDirection as t, observeDocumentDirection as D } from "./index148.js";
import "./index24.js";
import "./index98.js";
const v = ({ dir: e, children: i }) => {
  const [m, r] = o.useState(t);
  return o.useEffect(() => (r(t()), D(r)), []), /* @__PURE__ */ c(n, { dir: e ?? m, children: i });
};
export {
  v as DirectionProvider
};
//# sourceMappingURL=index80.js.map
