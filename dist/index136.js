const u = (n) => {
  const [i, t] = n.split(":").map(Number);
  return i * 60 + (t || 0);
}, S = (n) => u(n.end) <= u(n.start);
function f(n, i) {
  const [t, r, e] = n.split("-").map(Number);
  return new Date(Date.UTC(t, r - 1, e + i)).toISOString().slice(0, 10);
}
const m = /* @__PURE__ */ new Map();
function g(n, i) {
  const t = i ?? "";
  let r = m.get(t);
  r || (r = new Intl.DateTimeFormat("en-CA", {
    timeZone: i,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }), m.set(t, r));
  const e = Object.fromEntries(r.formatToParts(n).map((d) => [d.type, d.value]));
  return { y: +e.year, mo: +e.month, d: +e.day, h: +e.hour, mi: +e.minute, s: +e.second };
}
function p(n, i) {
  const t = g(n, i);
  return Date.UTC(t.y, t.mo - 1, t.d, t.h, t.mi, t.s) - Math.floor(n / 1e3) * 1e3;
}
function h(n, i, t) {
  const [r, e, d] = n.split("-").map(Number), a = Date.UTC(r, e - 1, d) + u(i) * 6e4, l = a - p(a, t);
  return a - p(l, t);
}
function D(n, i) {
  const t = g(n, i);
  return `${t.y}-${String(t.mo).padStart(2, "0")}-${String(t.d).padStart(2, "0")}`;
}
const w = (n) => [...n].sort((i, t) => u(i.start) - u(t.start));
function T(n, i, t) {
  const r = i.find((e) => e.id === n.id);
  return r ? {
    start: h(n.day, r.start, t),
    end: h(S(r) ? f(n.day, 1) : n.day, r.end, t)
  } : null;
}
function b(n, i, t, r = {}) {
  const e = typeof n == "number" ? n : n.getTime(), d = D(e, t), a = [];
  for (const o of [f(d, -1), d, f(d, 1)])
    for (const s of i) {
      const c = { id: s.id, day: o }, y = T(c, i, t);
      y && a.push({ ref: c, w: y });
    }
  const l = a.find((o) => o.w.start <= e && e < o.w.end);
  if (l) return l.ref;
  if (r.orNext) {
    const o = a.filter((s) => s.w.start > e).sort((s, c) => s.w.start - c.w.start)[0];
    if (o) return o.ref;
  }
  if (r.orPrevious) {
    const o = a.filter((s) => s.w.end <= e).sort((s, c) => c.w.end - s.w.end)[0];
    if (o) return o.ref;
  }
  return null;
}
function C(n, i) {
  const t = w(i), r = t.findIndex((e) => e.id === n.id);
  return r < 0 ? null : r + 1 < t.length ? { id: t[r + 1].id, day: n.day } : { id: t[0].id, day: f(n.day, 1) };
}
function I(n, i) {
  const t = w(i), r = t.findIndex((e) => e.id === n.id);
  return r < 0 ? null : r > 0 ? { id: t[r - 1].id, day: n.day } : { id: t[t.length - 1].id, day: f(n.day, -1) };
}
export {
  f as addPlantDays,
  C as nextShift,
  D as plantDayOf,
  I as previousShift,
  b as shiftAt,
  T as shiftWindow,
  h as wallClockToInstant
};
//# sourceMappingURL=index136.js.map
