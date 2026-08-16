import * as f from "react";
import * as p from "react-dom";
import { createSlot as c } from "./index152.js";
import { jsx as l } from "react/jsx-runtime";
var u = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
], h = u.reduce((t, i) => {
  const o = c(`Primitive.${i}`), r = f.forwardRef((e, m) => {
    const { asChild: s, ...a } = e, n = s ? o : i;
    return typeof window < "u" && (window[/* @__PURE__ */ Symbol.for("radix-ui")] = !0), /* @__PURE__ */ l(n, { ...a, ref: m });
  });
  return r.displayName = `Primitive.${i}`, { ...t, [i]: r };
}, {});
function w(t, i) {
  t && p.flushSync(() => t.dispatchEvent(i));
}
export {
  h as Primitive,
  w as dispatchDiscreteCustomEvent
};
//# sourceMappingURL=index201.js.map
