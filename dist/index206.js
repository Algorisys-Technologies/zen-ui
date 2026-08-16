import * as a from "react";
import { Primitive as o } from "./index201.js";
import { jsx as t } from "react/jsx-runtime";
var d = Object.freeze({
  // See: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss
  position: "absolute",
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  wordWrap: "normal"
}), l = "VisuallyHidden", e = a.forwardRef(
  (r, i) => /* @__PURE__ */ t(
    o.span,
    {
      ...r,
      ref: i,
      style: { ...d, ...r.style }
    }
  )
);
e.displayName = l;
var p = e;
export {
  p as Root,
  d as VISUALLY_HIDDEN_STYLES,
  e as VisuallyHidden
};
//# sourceMappingURL=index206.js.map
