import { tzOffset as s } from "./index317.js";
class o extends Date {
  //#region static
  constructor(...e) {
    super(), e.length > 1 && typeof e[e.length - 1] == "string" && (this.timeZone = e.pop()), this.internal = /* @__PURE__ */ new Date(), isNaN(s(this.timeZone, this)) ? this.setTime(NaN) : e.length ? typeof e[0] == "number" && (e.length === 1 || e.length === 2 && typeof e[1] != "number") ? this.setTime(e[0]) : typeof e[0] == "string" ? this.setTime(+new Date(e[0])) : e[0] instanceof Date ? this.setTime(+e[0]) : (this.setTime(+new Date(...e)), z(this, e)) : this.setTime(Date.now());
  }
  static tz(e, ...n) {
    return n.length ? new o(...n, e) : new o(Date.now(), e);
  }
  //#endregion
  //#region time zone
  withTimeZone(e) {
    return new o(+this, e);
  }
  getTimezoneOffset() {
    const e = -s(this.timeZone, this);
    return e > 0 ? Math.floor(e) : Math.ceil(e);
  }
  //#endregion
  //#region time
  setTime(e) {
    return Date.prototype.setTime.apply(this, arguments), p(this), +this;
  }
  //#endregion
  //#region date-fns integration
  [/* @__PURE__ */ Symbol.for("constructDateFrom")](e) {
    return new o(+new Date(e), this.timeZone);
  }
  //#endregion
}
const Z = /^(get|set)(?!UTC)/;
Object.getOwnPropertyNames(Date.prototype).forEach((t) => {
  if (!Z.test(t)) return;
  const e = t.replace(Z, "$1UTC");
  o.prototype[e] && (t.startsWith("get") ? o.prototype[t] = function() {
    return this.internal[e]();
  } : (o.prototype[t] = function() {
    return Date.prototype[e].apply(this.internal, arguments), j(this), +this;
  }, o.prototype[e] = function() {
    return Date.prototype[e].apply(this, arguments), p(this), +this;
  }));
});
function p(t) {
  t.internal.setTime(+t), t.internal.setUTCSeconds(t.internal.getUTCSeconds() - // Round after converting minutes to seconds to avoid fractional offset
  // precision errors from historical offsets.
  Math.round(-s(t.timeZone, t) * 60));
}
function j(t) {
  Date.prototype.setFullYear.call(t, t.internal.getUTCFullYear(), t.internal.getUTCMonth(), t.internal.getUTCDate()), Date.prototype.setHours.call(t, t.internal.getUTCHours(), t.internal.getUTCMinutes(), t.internal.getUTCSeconds(), t.internal.getUTCMilliseconds()), z(t);
}
function z(t, e) {
  const n = Array.isArray(e) ? v(e) : +t.internal, h = s(t.timeZone, t), i = h > 0 ? Math.floor(h) : Math.ceil(h), T = /* @__PURE__ */ new Date(+t);
  T.setUTCHours(T.getUTCHours() - 1);
  const r = -(/* @__PURE__ */ new Date(+t)).getTimezoneOffset(), S = -(/* @__PURE__ */ new Date(+T)).getTimezoneOffset(), b = r - S;
  let M = r;
  if (b && r !== i) {
    const l = Date.prototype.getHours.apply(t), U = Array.isArray(e) ? e[3] || 0 : t.internal.getUTCHours();
    if (l !== U) {
      const f = /* @__PURE__ */ new Date(+t), H = r - i;
      H && f.setUTCMinutes(f.getUTCMinutes() + H);
      const O = s(t.timeZone, f);
      (O > 0 ? Math.floor(O) : Math.ceil(O)) === i && (M = S);
    }
  }
  const u = M - i;
  u && Date.prototype.setUTCMinutes.call(t, Date.prototype.getUTCMinutes.call(t) + u);
  const m = /* @__PURE__ */ new Date(+t);
  m.setUTCSeconds(0);
  const g = r > 0 ? m.getSeconds() : (m.getSeconds() - 60) % 60, a = Math.round(-(s(t.timeZone, t) * 60)) % 60;
  (a || g) && Date.prototype.setUTCSeconds.call(t, Date.prototype.getUTCSeconds.call(t) + a + g);
  const y = s(t.timeZone, t), c = y > 0 ? Math.floor(y) : Math.ceil(y), F = -(/* @__PURE__ */ new Date(+t)).getTimezoneOffset() - c, I = c !== i, D = F - u, w = c - i, N = n - c * 60 * 1e3, W = w > 0 && x(t) - n === w * 60 * 1e3 && x(t, N) !== n;
  if (I && D && !W) {
    Date.prototype.setUTCMinutes.call(t, Date.prototype.getUTCMinutes.call(t) + D);
    const l = s(t.timeZone, t), U = l > 0 ? Math.floor(l) : Math.ceil(l), f = c - U;
    f && D < 0 && Date.prototype.setUTCMinutes.call(t, Date.prototype.getUTCMinutes.call(t) + f);
  }
  p(t);
  const C = (e ? n : n + a * 1e3) - +t.internal;
  C && Math.abs(C) < 1800 * 1e3 && (Date.prototype.setTime.call(t, +t + C), p(t));
}
function v(t) {
  return Date.UTC(t[0], t.length > 1 ? t[1] : 0, t.length > 2 ? t[2] : 1, ...t.slice(3));
}
function x(t, e) {
  const n = new Date(e ?? +t);
  return n.setUTCSeconds(n.getUTCSeconds() - Math.round(-s(t.timeZone, n) * 60)), +n;
}
export {
  o as TZDateMini
};
//# sourceMappingURL=index316.js.map
