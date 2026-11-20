import { objectSpread2 as i } from "./index392.js";
function a(t, f) {
  return Object.keys(f).forEach(function(n) {
    f[n] instanceof Object && t[n] && Object.assign(f[n], a(t[n], f[n]));
  }), i(i({}, t), f);
}
export {
  a as default
};
//# sourceMappingURL=index397.js.map
