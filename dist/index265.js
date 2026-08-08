import { TZDate as a } from "./index314.js";
import "./index316.js";
import { endOfBroadcastWeek as f } from "./index321.js";
import { startOfBroadcastWeek as d } from "./index322.js";
import { enUS as m } from "./index288.js";
import { addDays as v } from "./index323.js";
import { addMonths as p } from "./index324.js";
import { addWeeks as O } from "./index325.js";
import { addYears as c } from "./index326.js";
import { differenceInCalendarDays as u } from "./index327.js";
import { differenceInCalendarMonths as l } from "./index328.js";
import { eachMonthOfInterval as M } from "./index329.js";
import { eachYearOfInterval as k } from "./index330.js";
import { endOfISOWeek as W } from "./index331.js";
import { endOfMonth as D } from "./index332.js";
import { endOfWeek as Y } from "./index333.js";
import { endOfYear as S } from "./index334.js";
import { format as y } from "./index335.js";
import { getISOWeek as g } from "./index336.js";
import { getMonth as I } from "./index337.js";
import { getYear as w } from "./index338.js";
import { getWeek as B } from "./index339.js";
import { isAfter as L } from "./index340.js";
import { isBefore as C } from "./index341.js";
import { isDate as z } from "./index342.js";
import { isSameDay as Z } from "./index343.js";
import { isSameMonth as b } from "./index344.js";
import { isSameYear as A } from "./index345.js";
import { max as F } from "./index346.js";
import { min as N } from "./index347.js";
import { setMonth as _ } from "./index348.js";
import { setYear as j } from "./index349.js";
import { startOfDay as x } from "./index350.js";
import { startOfISOWeek as H } from "./index351.js";
import { startOfMonth as K } from "./index352.js";
import { startOfWeek as T } from "./index353.js";
import { startOfYear as U } from "./index354.js";
class n {
  /**
   * Creates an instance of `DateLib`.
   *
   * @param options Configuration options for the date library.
   * @param overrides Custom overrides for the date library functions.
   */
  constructor(t, i) {
    this.today = () => {
      if (this.overrides?.today)
        return this.overrides.today();
      if (this.options.timeZone)
        return a.tz(this.options.timeZone);
      const r = this.options.Date ?? Date;
      return new r();
    }, this.newDate = (r, e, s) => this.overrides?.newDate ? this.overrides.newDate(r, e, s) : this.options.timeZone ? new a(r, e, s, this.options.timeZone) : new Date(r, e, s), this.addDays = (r, e) => this.overrides?.addDays ? this.overrides.addDays(r, e) : v(r, e), this.addMonths = (r, e) => this.overrides?.addMonths ? this.overrides.addMonths(r, e) : p(r, e), this.addWeeks = (r, e) => this.overrides?.addWeeks ? this.overrides.addWeeks(r, e) : O(r, e), this.addYears = (r, e) => this.overrides?.addYears ? this.overrides.addYears(r, e) : c(r, e), this.differenceInCalendarDays = (r, e) => this.overrides?.differenceInCalendarDays ? this.overrides.differenceInCalendarDays(r, e) : u(r, e), this.differenceInCalendarMonths = (r, e) => this.overrides?.differenceInCalendarMonths ? this.overrides.differenceInCalendarMonths(r, e) : l(r, e), this.eachMonthOfInterval = (r) => this.overrides?.eachMonthOfInterval ? this.overrides.eachMonthOfInterval(r) : M(r), this.eachYearOfInterval = (r) => {
      const e = this.overrides?.eachYearOfInterval ? this.overrides.eachYearOfInterval(r) : k(r), s = new Set(e.map((h) => this.getYear(h)));
      if (s.size === e.length)
        return e;
      const o = [];
      return s.forEach((h) => {
        o.push(new Date(h, 0, 1));
      }), o;
    }, this.endOfBroadcastWeek = (r) => this.overrides?.endOfBroadcastWeek ? this.overrides.endOfBroadcastWeek(r) : f(r, this), this.endOfISOWeek = (r) => this.overrides?.endOfISOWeek ? this.overrides.endOfISOWeek(r) : W(r), this.endOfMonth = (r) => this.overrides?.endOfMonth ? this.overrides.endOfMonth(r) : D(r), this.endOfWeek = (r, e) => this.overrides?.endOfWeek ? this.overrides.endOfWeek(r, e) : Y(r, this.options), this.endOfYear = (r) => this.overrides?.endOfYear ? this.overrides.endOfYear(r) : S(r), this.format = (r, e, s) => {
      const o = this.overrides?.format ? this.overrides.format(r, e, this.options) : y(r, e, this.options);
      return this.options.numerals && this.options.numerals !== "latn" ? this.replaceDigits(o) : o;
    }, this.getISOWeek = (r) => this.overrides?.getISOWeek ? this.overrides.getISOWeek(r) : g(r), this.getMonth = (r, e) => this.overrides?.getMonth ? this.overrides.getMonth(r, this.options) : I(r, this.options), this.getYear = (r, e) => this.overrides?.getYear ? this.overrides.getYear(r, this.options) : w(r, this.options), this.getWeek = (r, e) => this.overrides?.getWeek ? this.overrides.getWeek(r, this.options) : B(r, this.options), this.isAfter = (r, e) => this.overrides?.isAfter ? this.overrides.isAfter(r, e) : L(r, e), this.isBefore = (r, e) => this.overrides?.isBefore ? this.overrides.isBefore(r, e) : C(r, e), this.isDate = (r) => this.overrides?.isDate ? this.overrides.isDate(r) : z(r), this.isSameDay = (r, e) => this.overrides?.isSameDay ? this.overrides.isSameDay(r, e) : Z(r, e), this.isSameMonth = (r, e) => this.overrides?.isSameMonth ? this.overrides.isSameMonth(r, e) : b(r, e), this.isSameYear = (r, e) => this.overrides?.isSameYear ? this.overrides.isSameYear(r, e) : A(r, e), this.max = (r) => this.overrides?.max ? this.overrides.max(r) : F(r), this.min = (r) => this.overrides?.min ? this.overrides.min(r) : N(r), this.setMonth = (r, e) => this.overrides?.setMonth ? this.overrides.setMonth(r, e) : _(r, e), this.setYear = (r, e) => this.overrides?.setYear ? this.overrides.setYear(r, e) : j(r, e), this.startOfBroadcastWeek = (r, e) => this.overrides?.startOfBroadcastWeek ? this.overrides.startOfBroadcastWeek(r, this) : d(r, this), this.startOfDay = (r) => this.overrides?.startOfDay ? this.overrides.startOfDay(r) : x(r), this.startOfISOWeek = (r) => this.overrides?.startOfISOWeek ? this.overrides.startOfISOWeek(r) : H(r), this.startOfMonth = (r) => this.overrides?.startOfMonth ? this.overrides.startOfMonth(r) : K(r), this.startOfWeek = (r, e) => this.overrides?.startOfWeek ? this.overrides.startOfWeek(r, this.options) : T(r, this.options), this.startOfYear = (r) => this.overrides?.startOfYear ? this.overrides.startOfYear(r) : U(r), this.options = { locale: m, ...t }, this.overrides = i;
  }
  /**
   * Generates a mapping of Arabic digits (0-9) to the target numbering system
   * digits.
   *
   * @since 9.5.0
   * @returns A record mapping Arabic digits to the target numerals.
   */
  getDigitMap() {
    const { numerals: t = "latn" } = this.options, i = new Intl.NumberFormat("en-US", {
      numberingSystem: t
    }), r = {};
    for (let e = 0; e < 10; e++)
      r[e.toString()] = i.format(e);
    return r;
  }
  /**
   * Replaces Arabic digits in a string with the target numbering system digits.
   *
   * @since 9.5.0
   * @param input The string containing Arabic digits.
   * @returns The string with digits replaced.
   */
  replaceDigits(t) {
    const i = this.getDigitMap();
    return t.replace(/\d/g, (r) => i[r] || r);
  }
  /**
   * Formats a number using the configured numbering system.
   *
   * @since 9.5.0
   * @param value The number to format.
   * @returns The formatted number as a string.
   */
  formatNumber(t) {
    return this.replaceDigits(t.toString());
  }
  /**
   * Returns the preferred ordering for month and year labels for the current
   * locale.
   */
  getMonthYearOrder() {
    const t = this.options.locale?.code;
    return t && n.yearFirstLocales.has(t) ? "year-first" : "month-first";
  }
  /**
   * Formats the month/year pair respecting locale conventions.
   *
   * @since 9.11.0
   */
  formatMonthYear(t) {
    const { locale: i, timeZone: r, numerals: e } = this.options, s = i?.code;
    if (s && n.yearFirstLocales.has(s))
      try {
        return new Intl.DateTimeFormat(s, {
          month: "long",
          year: "numeric",
          timeZone: r,
          numberingSystem: e
        }).format(t);
      } catch {
      }
    const o = this.getMonthYearOrder() === "year-first" ? "y LLLL" : "LLLL y";
    return this.format(t, o);
  }
}
n.yearFirstLocales = /* @__PURE__ */ new Set([
  "eu",
  "hu",
  "ja",
  "ja-Hira",
  "ja-JP",
  "ko",
  "ko-KR",
  "lt",
  "lt-LT",
  "lv",
  "lv-LV",
  "mn",
  "mn-MN",
  "zh",
  "zh-CN",
  "zh-HK",
  "zh-TW"
]);
const Br = new n();
export {
  n as DateLib,
  Br as defaultDateLib,
  m as defaultLocale
};
//# sourceMappingURL=index265.js.map
