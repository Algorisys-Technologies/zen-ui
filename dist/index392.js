import { objectSpread2 as i } from "./index387.js";
function a(t, f) {
  return Object.keys(f).forEach(function(n) {
    f[n] instanceof Object && t[n] && Object.assign(f[n], a(t[n], f[n]));
  }), i(i({}, t), f);
}
export {
  a as default
};
//# sourceMappingURL=index392.js.map
