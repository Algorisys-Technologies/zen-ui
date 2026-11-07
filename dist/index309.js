import { UI as f } from "./index313.js";
function n(r, o = {}, i = {}) {
  let e = { ...o?.[f.Day] };
  return Object.entries(r).filter(([, t]) => t === !0).forEach(([t]) => {
    e = {
      ...e,
      ...i?.[t]
    };
  }), e;
}
export {
  n as getStyleForModifiers
};
//# sourceMappingURL=index309.js.map
