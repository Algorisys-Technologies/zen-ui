import { defaultDateLib as o } from "./index256.js";
class y {
  constructor(t, i, s = o) {
    this.date = t, this.displayMonth = i, this.outside = !!(i && !s.isSameMonth(t, i)), this.dateLib = s, this.isoDate = s.format(t, "yyyy-MM-dd"), this.displayMonthId = s.format(i, "yyyy-MM"), this.dateMonthId = s.format(t, "yyyy-MM");
  }
  /**
   * Checks if this day is equal to another `CalendarDay`, considering both the
   * date and the displayed month.
   *
   * @param day The `CalendarDay` to compare with.
   * @returns `true` if the days are equal, otherwise `false`.
   */
  isEqualTo(t) {
    return this.dateLib.isSameDay(t.date, this.date) && this.dateLib.isSameMonth(t.displayMonth, this.displayMonth);
  }
}
export {
  y as CalendarDay
};
//# sourceMappingURL=index307.js.map
