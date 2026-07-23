const m = 0.1, g = (t) => {
  const e = Math.floor(t / 3600), s = Math.floor(t % 3600 / 60), n = Math.floor(t % 60), f = Math.floor(t % 1 * 100), r = (a) => String(a).padStart(2, "0");
  return `${r(e)}:${r(s)}:${r(n)}.${r(f)}`;
}, $ = (t, e, s, n, f, r = 0.1) => {
  const a = t.slice(), o = a[e];
  if (!o) return { ranges: a, edgeTime: n };
  const h = e > 0 ? a[e - 1].end + r : 0, d = e < a.length - 1 ? a[e + 1].start - r : f;
  let M;
  return s === "start" ? (M = Math.max(h, Math.min(n, o.end - r)), a[e] = { start: M, end: o.end }) : (M = Math.max(o.start + r, Math.min(n, d)), a[e] = { start: o.start, end: M }), { ranges: a, edgeTime: M };
}, u = (t, e, s, n) => {
  const f = n.minDuration ?? 0.1;
  if (e === "start") {
    const o = Math.max(
      -t.start,
      -t.offset,
      Math.min(s - t.offset, t.end - f - t.start)
    );
    return { offset: t.offset + o, start: t.start + o, end: t.end };
  }
  const r = t.offset + (t.end - t.start), a = Math.max(
    t.start + f - t.end,
    Math.min(s - r, n.audioDuration - t.end, n.laneDuration - r)
  );
  return { offset: t.offset, start: t.start, end: t.end + a };
}, E = (t, e, s) => {
  const n = t.end - t.start;
  return {
    offset: Math.max(0, Math.min(e, s - n)),
    start: t.start,
    end: t.end
  };
}, c = (t, e = 0.02) => {
  if (t.length === 0) return "";
  const s = (a) => Math.max(e, Math.min(1, a)), n = (a) => String(Math.round(a * 1e3) / 1e3);
  let f = "", r = "";
  for (let a = 0; a < t.length; a++) {
    const o = s(t[a]);
    f += `${a === 0 ? "M" : "L"}${a},${n(1 - o)}L${a + 1},${n(1 - o)}`, r = `L${a + 1},${n(1 + o)}L${a},${n(1 + o)}` + r;
  }
  return `${f}${r}Z`;
}, A = (t) => Math.max(3, Math.min(97, t));
export {
  m as MIN_MEDIA_RANGE,
  A as clampBadgePct,
  u as dragClipEdge,
  $ as dragRangeEdge,
  g as formatMediaTime,
  E as moveClip,
  c as waveformPath
};
//# sourceMappingURL=index29.js.map
