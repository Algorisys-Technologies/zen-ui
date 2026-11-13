function t(n) {
  return n.good >= n.target ? { kind: "done" } : n.state === "unknown" ? { kind: "unknown" } : n.state !== "running" ? { kind: "not-running" } : !n.perHour || !(n.perHour > 0) ? { kind: "no-rate" } : { kind: "eta", at: (typeof n.now == "number" ? n.now : n.now.getTime()) + (n.target - n.good) / n.perHour * 36e5 };
}
export {
  t as lineEta
};
//# sourceMappingURL=index142.js.map
