import { createComponent as s, Dynamic as a, mergeProps as n } from "solid-js/web";
import { mergeProps as c, splitProps as p } from "solid-js";
import { badgeVariants as m } from "./index107.js";
import { cn as i } from "./index106.js";
const u = (o) => {
  const e = c({
    as: "span"
  }, o), [r, t] = p(e, ["as", "class", "variant", "color", "children"]);
  return s(a, n({
    get component() {
      return r.as;
    },
    get class() {
      return i(m({
        variant: r.variant,
        color: r.color
      }), r.class);
    }
  }, t, {
    get children() {
      return r.children;
    }
  }));
};
export {
  u as Badge,
  m as badgeVariants
};
//# sourceMappingURL=index31.js.map
