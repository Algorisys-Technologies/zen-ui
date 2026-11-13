import { defaultDateLib as o } from "./index343.js";
function a(r, t = o) {
  return r < 10 ? t.formatNumber(`0${r.toLocaleString()}`) : t.formatNumber(`${r.toLocaleString()}`);
}
export {
  a as formatWeekNumber
};
//# sourceMappingURL=index372.js.map
