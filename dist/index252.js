import o, { useCallback as c } from "react";
import { UI as e } from "./index278.js";
import { useDayPicker as C } from "./index281.js";
function k(d) {
  const { onPreviousClick: s, onNextClick: u, previousMonth: t, nextMonth: n, ...h } = d, { components: a, classNames: l, styles: r, labels: { labelPrevious: m, labelNext: v } } = C(), b = c((i) => {
    n && u?.(i);
  }, [n, u]), f = c((i) => {
    t && s?.(i);
  }, [t, s]);
  return o.createElement(
    "nav",
    { ...h },
    o.createElement(
      a.PreviousMonthButton,
      { type: "button", className: l[e.PreviousMonthButton], style: r?.[e.PreviousMonthButton], tabIndex: t ? void 0 : -1, "aria-disabled": t ? void 0 : !0, "aria-label": m(t), onClick: f },
      o.createElement(a.Chevron, { disabled: t ? void 0 : !0, className: l[e.Chevron], style: r?.[e.Chevron], orientation: "left" })
    ),
    o.createElement(
      a.NextMonthButton,
      { type: "button", className: l[e.NextMonthButton], style: r?.[e.NextMonthButton], tabIndex: n ? void 0 : -1, "aria-disabled": n ? void 0 : !0, "aria-label": v(n), onClick: b },
      o.createElement(a.Chevron, { disabled: n ? void 0 : !0, orientation: "right", className: l[e.Chevron], style: r?.[e.Chevron] })
    )
  );
}
export {
  k as Nav
};
//# sourceMappingURL=index252.js.map
