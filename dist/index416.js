import * as o from "react";
import { stylesheetSingleton as r } from "./index417.js";
var i = function() {
  var t = r();
  return function(e, n) {
    o.useEffect(function() {
      return t.add(e), function() {
        t.remove();
      };
    }, [e && n]);
  };
};
export {
  i as styleHookSingleton
};
//# sourceMappingURL=index416.js.map
