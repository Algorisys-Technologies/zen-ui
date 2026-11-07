import * as o from "./index332.js";
import { labelWeekday as b } from "./index340.js";
import { labelWeekNumberHeader as i } from "./index342.js";
import { labelNav as n } from "./index337.js";
import { labelGridcell as t } from "./index335.js";
import { labelGrid as d } from "./index334.js";
import { labelYearDropdown as p } from "./index343.js";
import { labelWeekNumber as m } from "./index341.js";
import { labelPrevious as f } from "./index339.js";
import { labelNext as N } from "./index338.js";
import { labelMonthDropdown as k } from "./index336.js";
import { labelDayButton as D } from "./index333.js";
const r = (l, a, e) => a || (e ? typeof e == "function" ? e : (...W) => e : l);
function Y(l, a) {
  const e = a.locale?.labels ?? {};
  return {
    ...o,
    ...l ?? {},
    labelDayButton: r(D, l?.labelDayButton, e.labelDayButton),
    labelMonthDropdown: r(k, l?.labelMonthDropdown, e.labelMonthDropdown),
    labelNext: r(N, l?.labelNext, e.labelNext),
    labelPrevious: r(f, l?.labelPrevious, e.labelPrevious),
    labelWeekNumber: r(m, l?.labelWeekNumber, e.labelWeekNumber),
    labelYearDropdown: r(p, l?.labelYearDropdown, e.labelYearDropdown),
    labelGrid: r(d, l?.labelGrid, e.labelGrid),
    labelGridcell: r(t, l?.labelGridcell, e.labelGridcell),
    labelNav: r(n, l?.labelNav, e.labelNav),
    labelWeekNumberHeader: r(i, l?.labelWeekNumberHeader, e.labelWeekNumberHeader),
    labelWeekday: r(b, l?.labelWeekday, e.labelWeekday)
  };
}
export {
  Y as getLabels
};
//# sourceMappingURL=index307.js.map
