const v = (a) => Number.isFinite(a) && a > 0 ? a : 0;
function f(a, r, c = {}) {
  const t = v(a), i = v(r);
  if (i === 0) return { booked: t, available: i, load: null, status: t > 0 ? "no-capacity" : "closed" };
  const b = t / i, s = 1e-9, d = t === 0 ? "free" : b > 1 + s ? "over" : b >= (c.high ?? 0.85) - s ? "high" : "ok";
  return { booked: t, available: i, load: b, status: d };
}
function h(a) {
  const r = { high: a.high }, c = /* @__PURE__ */ new Map();
  for (const o of a.cells) {
    const e = `${o.row}\0${o.period}`, n = c.get(e) ?? { booked: 0, available: 0 };
    c.set(e, { booked: n.booked + v(o.booked), available: n.available + v(o.available) });
  }
  const t = {}, i = {}, b = {};
  let s = { booked: 0, available: 0 }, d = 0;
  for (const o of a.rows) {
    t[o.id] = {};
    for (const e of a.periods) {
      const n = c.get(`${o.id}\0${e.id}`) ?? { booked: 0, available: 0 }, l = f(n.booked, n.available, r);
      t[o.id][e.id] = l, (l.status === "over" || l.status === "no-capacity") && d++;
      const p = i[o.id] ??= { booked: 0, available: 0 };
      p.booked += l.booked, p.available += l.available;
      const u = b[e.id] ??= { booked: 0, available: 0 };
      u.booked += l.booked, u.available += l.available, s = { booked: s.booked + l.booked, available: s.available + l.available };
    }
  }
  const k = (o) => f(o.booked, o.available, r);
  return {
    cells: t,
    rowTotals: Object.fromEntries(Object.entries(i).map(([o, e]) => [o, k(e)])),
    periodTotals: Object.fromEntries(Object.entries(b).map(([o, e]) => [o, k(e)])),
    total: k(s),
    overCount: d
  };
}
export {
  f as capacityCell,
  h as capacityGrid
};
//# sourceMappingURL=index144.js.map
