import { DateLib as a } from "./index343.js";
function f(t, l, o, r) {
  let e = (r ?? new a(o)).format(t, "PPPP");
  return l?.today && (e = `Today, ${e}`), e;
}
export {
  f as labelGridcell
};
//# sourceMappingURL=index378.js.map
