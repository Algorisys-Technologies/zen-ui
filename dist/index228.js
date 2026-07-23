import { setDefaultOpts as l, defaultOpts as g } from "./index136.js";
import { store as p, dispatch as u } from "./index225.js";
import { defaultToasterOptions as f } from "./index227.js";
import { ActionType as d } from "./index226.js";
const O = /* @__PURE__ */ (() => {
  let t = 0;
  return () => String(++t);
})(), S = (t) => {
  l((e) => ({
    containerClassName: t.containerClassName ?? e.containerClassName,
    containerStyle: t.containerStyle ?? e.containerStyle,
    gutter: t.gutter ?? e.gutter,
    position: t.position ?? e.position,
    toastOptions: {
      ...t.toastOptions
    }
  }));
}, b = (t, e) => {
  const s = t.includes("top") ? { top: 0, "margin-top": `${e}px` } : { bottom: 0, "margin-bottom": `${e}px` }, i = t.includes("center") ? { "justify-content": "center" } : t.includes("right") ? { "justify-content": "flex-end" } : {};
  return {
    left: 0,
    right: 0,
    display: "flex",
    position: "absolute",
    transition: "all 230ms cubic-bezier(.21,1.02,.73,1)",
    ...s,
    ...i
  };
}, C = (t, e) => {
  const n = t.getBoundingClientRect();
  n.height !== e.height && u({
    type: d.UPDATE_TOAST,
    toast: { id: e.id, height: n.height }
  });
}, A = (t, e) => {
  const { toasts: n } = p, s = g().gutter || f.gutter || 8, i = n.filter((o) => (o.position || e) === e && o.height), c = i.findIndex((o) => o.id === t.id), a = i.filter((o, r) => r < c && o.visible).length;
  return i.slice(0, a).reduce((o, r) => o + s + (r.height || 0), 0);
}, D = (t, e) => (t.position || e).includes("top") ? 1 : -1;
export {
  O as generateID,
  b as getToastWrapperStyles,
  D as getToastYDirection,
  A as getWrapperYAxisOffset,
  S as mergeContainerOptions,
  C as updateToastHeight
};
//# sourceMappingURL=index228.js.map
