import { DayFlag as s } from "./index278.js";
var d;
(function(e) {
  e[e.Today = 0] = "Today", e[e.Selected = 1] = "Selected", e[e.LastFocused = 2] = "LastFocused", e[e.FocusedModifier = 3] = "FocusedModifier";
})(d || (d = {}));
function l(e) {
  return !e[s.disabled] && !e[s.hidden] && !e[s.outside];
}
function F(e, u, t, n) {
  let f, c = -1;
  for (const o of e) {
    const a = u(o);
    l(a) && (a[s.focused] && c < d.FocusedModifier ? (f = o, c = d.FocusedModifier) : n?.isEqualTo(o) && c < d.LastFocused ? (f = o, c = d.LastFocused) : t(o.date) && c < d.Selected ? (f = o, c = d.Selected) : a[s.today] && c < d.Today && (f = o, c = d.Today));
  }
  return f || (f = e.find((o) => l(u(o)))), f;
}
export {
  F as calculateFocusTarget
};
//# sourceMappingURL=index366.js.map
