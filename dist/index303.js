import { tzName as r } from "./index304.js";
import { TZDateMini as s } from "./index305.js";
class o extends s {
  //#region static
  static tz(t, ...e) {
    return e.length ? new o(...e, t) : new o(Date.now(), t);
  }
  //#endregion
  //#region representation
  toISOString() {
    const [t, e, n] = this.tzComponents(), i = `${t}${e}:${n}`;
    return this.internal.toISOString().slice(0, -1) + i;
  }
  toString() {
    return `${this.toDateString()} ${this.toTimeString()}`;
  }
  toDateString() {
    const [t, e, n, i] = this.internal.toUTCString().split(" ");
    return `${t?.slice(0, -1)} ${n} ${e} ${i}`;
  }
  toTimeString() {
    const t = this.internal.toUTCString().split(" ")[4], [e, n, i] = this.tzComponents();
    return `${t} GMT${e}${n}${i} (${r(this.timeZone, this)})`;
  }
  toLocaleString(t, e) {
    return Date.prototype.toLocaleString.call(this, t, {
      ...e,
      timeZone: e?.timeZone || this.timeZone
    });
  }
  toLocaleDateString(t, e) {
    return Date.prototype.toLocaleDateString.call(this, t, {
      ...e,
      timeZone: e?.timeZone || this.timeZone
    });
  }
  toLocaleTimeString(t, e) {
    return Date.prototype.toLocaleTimeString.call(this, t, {
      ...e,
      timeZone: e?.timeZone || this.timeZone
    });
  }
  //#endregion
  //#region private
  tzComponents() {
    const t = this.getTimezoneOffset(), e = t > 0 ? "-" : "+", n = String(Math.floor(Math.abs(t) / 60)).padStart(2, "0"), i = String(Math.abs(t) % 60).padStart(2, "0");
    return [e, n, i];
  }
  //#endregion
  withTimeZone(t) {
    return new o(+this, t);
  }
  //#region date-fns integration
  [/* @__PURE__ */ Symbol.for("constructDateFrom")](t) {
    return new o(+new Date(t), this.timeZone);
  }
  //#endregion
}
export {
  o as TZDate
};
//# sourceMappingURL=index303.js.map
