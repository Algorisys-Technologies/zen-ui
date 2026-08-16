import { jsx as l, jsxs as m } from "react/jsx-runtime";
import * as t from "react";
import { Avatar as c, AvatarFallback as f, AvatarImage as u } from "./index161.js";
import { cn as r } from "./index145.js";
const y = {
  xs: "zen-h-6 zen-w-6 zen-text-xs",
  sm: "zen-h-8 zen-w-8 zen-text-xs",
  md: "zen-h-10 zen-w-10 zen-text-sm",
  lg: "zen-h-12 zen-w-12 zen-text-base",
  xl: "zen-h-16 zen-w-16 zen-text-lg"
}, h = t.forwardRef(({ className: a, size: e = "md", ...n }, s) => /* @__PURE__ */ l(
  c,
  {
    ref: s,
    className: r(
      "zen-relative zen-inline-flex zen-shrink-0 zen-overflow-hidden zen-rounded-zen-full",
      y[e],
      a
    ),
    ...n
  }
));
h.displayName = c.displayName;
const b = t.forwardRef(({ className: a, ...e }, n) => /* @__PURE__ */ l(
  u,
  {
    ref: n,
    className: r("zen-aspect-square zen-h-full zen-w-full zen-object-cover", a),
    ...e
  }
));
b.displayName = u.displayName;
const v = t.forwardRef(({ className: a, ...e }, n) => /* @__PURE__ */ l(
  f,
  {
    ref: n,
    className: r(
      "zen-flex zen-h-full zen-w-full zen-items-center zen-justify-center zen-bg-zen-muted zen-text-zen-muted-fg zen-font-medium",
      a
    ),
    ...e
  }
));
v.displayName = f.displayName;
const i = {
  tight: "-zen-ml-3",
  default: "-zen-ml-2",
  loose: "-zen-ml-1"
}, x = t.forwardRef(
  ({ className: a, max: e, spacing: n = "default", size: s = "md", children: p, ...g }, A) => {
    const z = t.Children.toArray(p), N = typeof e == "number" ? z.slice(0, e) : z, o = typeof e == "number" && z.length > e ? z.length - e : 0;
    return /* @__PURE__ */ m(
      "div",
      {
        ref: A,
        className: r("zen-flex zen-items-center", a),
        ...g,
        children: [
          N.map((w, d) => /* @__PURE__ */ l(
            "div",
            {
              className: r(
                "zen-ring-2 zen-ring-zen-background zen-rounded-zen-full",
                d > 0 && i[n]
              ),
              children: w
            },
            d
          )),
          o > 0 ? /* @__PURE__ */ l("div", { className: r("zen-ring-2 zen-ring-zen-background zen-rounded-zen-full", i[n]), children: /* @__PURE__ */ l(h, { size: s, children: /* @__PURE__ */ m(v, { children: [
            "+",
            o
          ] }) }) }) : null
        ]
      }
    );
  }
);
x.displayName = "AvatarGroup";
export {
  h as Avatar,
  v as AvatarFallback,
  x as AvatarGroup,
  b as AvatarImage
};
//# sourceMappingURL=index42.js.map
