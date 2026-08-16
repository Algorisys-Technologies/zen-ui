import { UI as t, DayFlag as e, SelectionState as r, Animation as s } from "./index269.js";
function i() {
  const o = {};
  for (const n in t)
    o[t[n]] = `rdp-${t[n]}`;
  for (const n in e)
    o[e[n]] = `rdp-${e[n]}`;
  for (const n in r)
    o[r[n]] = `rdp-${r[n]}`;
  for (const n in s)
    o[s[n]] = `rdp-${s[n]}`;
  return o;
}
export {
  i as getDefaultClassNames
};
//# sourceMappingURL=index261.js.map
