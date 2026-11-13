import { UI as f } from "./index356.js";
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
//# sourceMappingURL=index352.js.map
