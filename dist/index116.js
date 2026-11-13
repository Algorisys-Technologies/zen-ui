const o = [
  "running",
  "idle",
  "stopped",
  "fault",
  "waiting",
  "setup",
  "cleaning",
  "maintenance",
  "unknown"
], e = {
  running: { tone: "running", category: "productive" },
  idle: { tone: "idle", category: "no-demand" },
  stopped: { tone: "down", category: "unplanned-loss" },
  fault: { tone: "down", category: "unplanned-loss" },
  waiting: { tone: "down", category: "unplanned-loss" },
  setup: { tone: "setup", category: "changeover" },
  cleaning: { tone: "planned", category: "planned-stop" },
  maintenance: { tone: "planned", category: "planned-stop" },
  unknown: { tone: "unknown", category: "no-data" }
};
function a(n) {
  return Object.prototype.hasOwnProperty.call(e, n);
}
function c(n) {
  return e[n].tone;
}
function r(n) {
  return e[n].category;
}
function i(n) {
  const t = e[n].category;
  return t === "unplanned-loss" || t === "changeover";
}
function u(n) {
  return `machineState.${n}`;
}
export {
  o as MACHINE_STATES,
  i as isAvailabilityLoss,
  a as isMachineState,
  r as machineStateCategory,
  u as machineStateMessageKey,
  c as machineStateTone
};
//# sourceMappingURL=index116.js.map
