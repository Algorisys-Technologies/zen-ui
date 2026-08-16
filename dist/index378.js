import { __rest as o, __assign as d } from "./index300.js";
import * as n from "react";
var i = function(r) {
  var e = r.sideCar, a = o(r, ["sideCar"]);
  if (!e)
    throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var t = e.read();
  if (!t)
    throw new Error("Sidecar medium not found");
  return n.createElement(t, d({}, a));
};
i.isSideCarExport = !0;
function p(r, e) {
  return r.useMedium(e), i;
}
export {
  p as exportSidecar
};
//# sourceMappingURL=index378.js.map
