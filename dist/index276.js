import * as o from "react";
import { useLayoutEffect as a } from "./index267.js";
var s = o[" useId ".trim().toString()] || (() => {
}), f = 0;
function i(t) {
  const [e, r] = o.useState(s());
  return a(() => {
    r((u) => u ?? String(f++));
  }, [t]), t || (e ? `radix-${e}` : "");
}
export {
  i as useId
};
//# sourceMappingURL=index276.js.map
