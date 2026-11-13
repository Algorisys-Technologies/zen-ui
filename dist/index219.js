const h = 300, a = ["start", "mid", "end"], l = {
  OneColumn: { start: 1 },
  TwoColumnsBeginExpanded: { start: 0.6666666666666666, mid: 0.3333333333333333 },
  TwoColumnsMidExpanded: { start: 0.3333333333333333, mid: 0.6666666666666666 },
  ThreeColumnsMidExpanded: { start: 0.25, mid: 0.5, end: 0.25 },
  ThreeColumnsEndExpanded: { start: 0.25, mid: 0.25, end: 0.5 },
  MidColumnFullScreen: { mid: 1 },
  EndColumnFullScreen: { end: 1 }
}, u = {
  ...l,
  ThreeColumnsMidExpanded: { mid: 2 / 3, end: 1 / 3 },
  ThreeColumnsEndExpanded: { mid: 1 / 3, end: 2 / 3 }
}, m = [
  [1, "full"],
  [2 / 3, "2/3"],
  [1 / 2, "1/2"],
  [1 / 3, "1/3"],
  [1 / 4, "1/4"]
];
function E(e) {
  const t = m.find(([o]) => Math.abs(o - e) < 1e-9);
  if (!t) throw new Error(`FlexibleColumnLayout: no share token for ${e}`);
  return t[1];
}
function c(e) {
  return Math.min(3, Math.max(1, Math.floor(e / 300)));
}
function M(e, t, o) {
  const r = t === 2 ? u[e] : l[e], d = a.filter((n) => r[n] && o[n]);
  if (t === 1) {
    const n = d[d.length - 1];
    return n ? [{ name: n, share: "full" }] : [];
  }
  const s = d.reduce((n, i) => n + r[i], 0);
  return d.map((n) => ({ name: n, share: E(r[n] / s) }));
}
export {
  h as FLEXIBLE_COLUMN_MIN_WIDTH,
  a as FLEXIBLE_COLUMN_ORDER,
  E as flexibleColumnShare,
  c as flexibleColumnsForWidth,
  M as resolveFlexibleColumns
};
//# sourceMappingURL=index219.js.map
