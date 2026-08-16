import { DateLib as a } from "./index256.js";
function f(t, l, o, r) {
  let e = (r ?? new a(o)).format(t, "PPPP");
  return l?.today && (e = `Today, ${e}`), e;
}
export {
  f as labelGridcell
};
//# sourceMappingURL=index291.js.map
