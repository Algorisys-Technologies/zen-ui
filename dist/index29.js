const $ = 0.1, c = (t) => {
  const e = Math.floor(t / 3600), f = Math.floor(t % 3600 / 60), s = Math.floor(t % 60), o = Math.floor(t % 1 * 100), n = (a) => String(a).padStart(2, "0");
  return `${n(e)}:${n(f)}:${n(s)}.${n(o)}`;
}, u = (t, e, f, s, o, n = 0.1, a = "partition") => {
  const r = t.slice(), h = r[e];
  if (!h) return { ranges: r, edgeTime: s };
  const d = a === "partition", g = d && e > 0 ? r[e - 1].end + n : 0, m = d && e < r.length - 1 ? r[e + 1].start - n : o;
  let M;
  return f === "start" ? (M = Math.max(g, Math.min(s, h.end - n)), r[e] = { start: M, end: h.end }) : (M = Math.max(h.start + n, Math.min(s, m)), r[e] = { start: h.start, end: M }), { ranges: r, edgeTime: M };
}, E = (t, e, f, s) => {
  const o = t.slice(), n = o[e];
  if (!n) return { ranges: o, start: f };
  const a = n.end - n.start, r = Math.max(0, Math.min(f, s - a));
  return o[e] = { start: r, end: r + a }, { ranges: o, start: r };
}, A = (t, e, f, s) => {
  const o = s.minDuration ?? 0.1;
  if (e === "start") {
    const r = Math.max(
      -t.start,
      -t.offset,
      Math.min(f - t.offset, t.end - o - t.start)
    );
    return { offset: t.offset + r, start: t.start + r, end: t.end };
  }
  const n = t.offset + (t.end - t.start), a = Math.max(
    t.start + o - t.end,
    Math.min(f - n, s.audioDuration - t.end, s.laneDuration - n)
  );
  return { offset: t.offset, start: t.start, end: t.end + a };
}, I = (t, e, f) => {
  const s = t.end - t.start;
  return {
    offset: Math.max(0, Math.min(e, f - s)),
    start: t.start,
    end: t.end
  };
}, N = (t, e = 0.02) => {
  if (t.length === 0) return "";
  const f = (a) => Math.max(e, Math.min(1, a)), s = (a) => String(Math.round(a * 1e3) / 1e3);
  let o = "", n = "";
  for (let a = 0; a < t.length; a++) {
    const r = f(t[a]);
    o += `${a === 0 ? "M" : "L"}${a},${s(1 - r)}L${a + 1},${s(1 - r)}`, n = `L${a + 1},${s(1 + r)}L${a},${s(1 + r)}` + n;
  }
  return `${o}${n}Z`;
}, _ = (t) => Math.max(3, Math.min(97, t));
export {
  $ as MIN_MEDIA_RANGE,
  _ as clampBadgePct,
  A as dragClipEdge,
  u as dragRangeEdge,
  c as formatMediaTime,
  I as moveClip,
  E as moveRange,
  N as waveformPath
};
//# sourceMappingURL=index29.js.map
