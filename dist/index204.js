function w(e) {
  try {
    const r = new Intl.DateTimeFormat(e, { year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(2026, 2, 15)).filter((t) => t.type === "year" || t.type === "month" || t.type === "day").map((t) => t.type[0]).join("");
    return r === "mdy" || r === "ymd" ? r : "dmy";
  } catch {
    return "dmy";
  }
}
function a(e, i, r) {
  if (!Number.isInteger(e) || !Number.isInteger(i) || !Number.isInteger(r) || i < 1 || i > 12 || r < 1 || e < 1 || e > 9999) return null;
  const t = new Date(e, i - 1, r);
  return t.setFullYear(e), t.getFullYear() === e && t.getMonth() === i - 1 && t.getDate() === r ? t : null;
}
function y(e, i) {
  const r = i.getFullYear();
  let n = Math.floor(r / 100) * 100 + e;
  return n > r + 50 ? n -= 100 : n <= r - 50 && (n += 100), n;
}
const v = (e) => new Date(e.getFullYear(), e.getMonth(), e.getDate());
function M(e, i) {
  const r = new Date(e.getFullYear(), e.getMonth() + i, 1), t = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
  return new Date(r.getFullYear(), r.getMonth(), Math.min(e.getDate(), t));
}
function f(e, i) {
  return new Date(e.getFullYear(), e.getMonth(), e.getDate() + i);
}
function $(e, i, r) {
  const t = e.trim().toLowerCase();
  if (t === "") return null;
  const n = v(r);
  if (t === "t" || t === "today") return n;
  if (t === "y" || t === "yesterday") return f(n, -1);
  if (t === "tomorrow") return f(n, 1);
  const o = /^([+-])\s*(\d{1,4})\s*([dwmy]?)$/.exec(t);
  if (o) {
    const l = Number(o[2]) * (o[1] === "-" ? -1 : 1);
    switch (o[3]) {
      case "w":
        return f(n, l * 7);
      case "m":
        return M(n, l);
      case "y":
        return M(n, l * 12);
      default:
        return f(n, l);
    }
  }
  const c = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  if (c) return a(+c[1], +c[2], +c[3]) ?? "invalid";
  const F = (l) => l === void 0 ? n.getFullYear() : l.length <= 2 ? y(+l, n) : +l;
  if (/[/\-. ]/.test(t)) {
    const l = t.split(/[/\-. ]+/).filter(Boolean);
    if (l.length < 2 || l.length > 3 || l.some((p) => !/^\d{1,4}$/.test(p))) return "invalid";
    let u, s, g;
    return i === "ymd" ? l.length === 2 ? [s, u] = l : [g, s, u] = l : i === "mdy" ? [s, u, g] = l : [u, s, g] = l, a(F(g), +s, +u) ?? "invalid";
  }
  if (!/^\d+$/.test(t)) return "invalid";
  if (t.length <= 2) return a(n.getFullYear(), n.getMonth() + 1, +t) ?? "invalid";
  if (i === "ymd")
    return t.length === 4 ? a(n.getFullYear(), +t.slice(0, 2), +t.slice(2)) ?? "invalid" : t.length === 6 ? a(y(+t.slice(0, 2), n), +t.slice(2, 4), +t.slice(4)) ?? "invalid" : t.length === 8 ? a(+t.slice(0, 4), +t.slice(4, 6), +t.slice(6)) ?? "invalid" : "invalid";
  const [D, h] = [t.slice(0, 2), t.slice(2, 4)], [d, m] = i === "mdy" ? [h, D] : [D, h];
  return t.length === 4 ? a(n.getFullYear(), +m, +d) ?? "invalid" : t.length === 6 ? a(y(+t.slice(4), n), +m, +d) ?? "invalid" : t.length === 8 ? a(+t.slice(4), +m, +d) ?? "invalid" : "invalid";
}
const Y = (e, i = 2) => String(e).padStart(i, "0");
function b(e, i) {
  const [r, t, n] = [Y(e.getFullYear(), 4), Y(e.getMonth() + 1), Y(e.getDate())];
  return i === "ymd" ? `${r}-${t}-${n}` : i === "mdy" ? `${t}/${n}/${r}` : `${n}/${t}/${r}`;
}
function I(e) {
  return e === "ymd" ? "YYYY-MM-DD" : e === "mdy" ? "MM/DD/YYYY" : "DD/MM/YYYY";
}
export {
  f as addDays,
  M as addMonths,
  y as expandYear,
  b as formatDateInput,
  a as makeDate,
  w as orderForLocale,
  $ as parseDateInput,
  I as patternFor
};
//# sourceMappingURL=index204.js.map
