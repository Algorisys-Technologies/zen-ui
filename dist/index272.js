import * as o from "./index297.js";
import { labelWeekday as b } from "./index305.js";
import { labelWeekNumberHeader as i } from "./index307.js";
import { labelNav as n } from "./index302.js";
import { labelGridcell as t } from "./index300.js";
import { labelGrid as d } from "./index299.js";
import { labelYearDropdown as p } from "./index308.js";
import { labelWeekNumber as m } from "./index306.js";
import { labelPrevious as f } from "./index304.js";
import { labelNext as N } from "./index303.js";
import { labelMonthDropdown as k } from "./index301.js";
import { labelDayButton as D } from "./index298.js";
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
//# sourceMappingURL=index272.js.map
