import { enUS as f } from "./index385.js";
import { format as n } from "./index335.js";
const s = {
  ...f,
  labels: {
    labelDayButton: (r, a, o, e) => {
      let t;
      e && typeof e.format == "function" ? t = e.format.bind(e) : t = (m, c) => n(m, c, { locale: f, ...o });
      let l = t(r, "PPPP");
      return a.today && (l = `Today, ${l}`), a.selected && (l = `${l}, selected`), l;
    },
    labelMonthDropdown: "Choose the Month",
    labelNext: "Go to the Next Month",
    labelPrevious: "Go to the Previous Month",
    labelWeekNumber: (r) => `Week ${r}`,
    labelYearDropdown: "Choose the Year",
    labelGrid: (r, a, o) => {
      let e;
      return o && typeof o.format == "function" ? e = o.format.bind(o) : e = (t, l) => n(t, l, { locale: f, ...a }), e(r, "LLLL yyyy");
    },
    labelGridcell: (r, a, o, e) => {
      let t;
      e && typeof e.format == "function" ? t = e.format.bind(e) : t = (m, c) => n(m, c, { locale: f, ...o });
      let l = t(r, "PPPP");
      return a?.today && (l = `Today, ${l}`), l;
    },
    labelNav: "Navigation bar",
    labelWeekNumberHeader: "Week Number",
    labelWeekday: (r, a, o) => {
      let e;
      return o && typeof o.format == "function" ? e = o.format.bind(o) : e = (t, l) => n(t, l, { locale: f, ...a }), e(r, "cccc");
    }
  }
};
export {
  s as enUS
};
//# sourceMappingURL=index288.js.map
