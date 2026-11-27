const o = (e, n) => Number.isFinite(e) && Number.isFinite(n) && n > 0 && e >= 0 ? e / n : null;
function i(e) {
  const n = e.idealCycleTime > 0;
  return {
    availability: o(e.runTime, e.plannedTime),
    performance: n ? o(e.idealCycleTime * e.totalCount, e.runTime) : null,
    quality: o(e.goodCount, e.totalCount),
    oee: n ? o(e.goodCount * e.idealCycleTime, e.plannedTime) : null
  };
}
const t = { fair: 0.65, good: 0.85 };
function r(e, n = t) {
  return e === null || !Number.isFinite(e) ? null : e >= n.good ? "good" : e >= n.fair ? "fair" : "poor";
}
function l(e) {
  return -90 + 180 * Math.min(1, Math.max(0, Number.isFinite(e) ? e : 0));
}
export {
  t as DEFAULT_OEE_BANDS,
  l as gaugeAngle,
  r as oeeBand,
  i as oeeFromCounts
};
//# sourceMappingURL=index118.js.map
