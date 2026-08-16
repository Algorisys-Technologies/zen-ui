import { jsx as z } from "react/jsx-runtime";
import * as d from "react";
import { cn as l } from "./index145.js";
const p = {
  start: "zen-items-start",
  center: "zen-items-center",
  end: "zen-items-end",
  stretch: "zen-items-stretch"
}, x = {
  start: "zen-justify-start",
  center: "zen-justify-center",
  end: "zen-justify-end",
  between: "zen-justify-between"
}, s = (e) => e === void 0 ? void 0 : typeof e == "number" ? `${e}px` : e, u = d.forwardRef(
  ({
    className: e,
    direction: r = "column",
    align: t,
    justify: n,
    wrap: o = !1,
    gap: c,
    padding: a,
    style: m,
    ...f
  }, i) => /* @__PURE__ */ z(
    "div",
    {
      ref: i,
      className: l(
        "zen-flex",
        r === "column" ? "zen-flex-col" : "zen-flex-row",
        o && "zen-flex-wrap",
        t && p[t],
        n && x[n],
        e
      ),
      style: { gap: s(c), padding: s(a), ...m },
      ...f
    }
  )
);
u.displayName = "Stack";
export {
  u as Stack
};
//# sourceMappingURL=index78.js.map
