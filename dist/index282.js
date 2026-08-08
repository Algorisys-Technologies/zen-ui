import { useState as a } from "react";
import { calculateFocusTarget as T } from "./index366.js";
import { getNextFocus as v } from "./index367.js";
function I(e, o, r, i, f) {
  const { autoFocus: F } = e, [d, m] = a(), c = T(o.days, r, i || (() => !1), d), [s, u] = a(F ? c : void 0);
  return {
    isFocusTarget: (n) => !!c?.isEqualTo(n),
    setFocused: u,
    focused: s,
    blur: () => {
      m(s), u(void 0);
    },
    moveFocus: (n, l) => {
      if (!s)
        return;
      const t = v(n, l, s, o.navStart, o.navEnd, e, f);
      t && (e.disableNavigation && !o.days.some((g) => g.isEqualTo(t)) || (o.goToDay(t), u(t)));
    }
  };
}
export {
  I as useFocus
};
//# sourceMappingURL=index282.js.map
