import { DateLib as n } from "./index343.js";
function f(a, t, l, o) {
  let e = (o ?? new n(l)).format(a, "PPPP");
  return t.today && (e = `Today, ${e}`), t.selected && (e = `${e}, selected`), e;
}
export {
  f as labelDayButton
};
//# sourceMappingURL=index376.js.map
