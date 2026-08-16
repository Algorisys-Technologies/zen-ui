import { jsx as c } from "react/jsx-runtime";
import * as o from "react";
import { DirectionProvider as n } from "./index173.js";
import "./index145.js";
import { readDocumentDirection as t, observeDocumentDirection as D } from "./index150.js";
import "./index25.js";
import "./index100.js";
const v = ({ dir: e, children: i }) => {
  const [m, r] = o.useState(t);
  return o.useEffect(() => (r(t()), D(r)), []), /* @__PURE__ */ c(n, { dir: e ?? m, children: i });
};
export {
  v as DirectionProvider
};
//# sourceMappingURL=index81.js.map
