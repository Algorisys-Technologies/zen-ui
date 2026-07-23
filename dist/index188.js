import { isString as r, isNumber as S } from "./index164.js";
import { createMemo as x } from "solid-js";
import { access as c } from "./index166.js";
function s(t) {
  let l = t.startIndex ?? 0;
  const o = t.startLevel ?? 0, i = [], f = (e) => {
    if (e == null)
      return "";
    const n = t.getKey ?? "key", u = r(n) ? e[n] : n(e);
    return u != null ? String(u) : "";
  }, h = (e) => {
    if (e == null)
      return "";
    const n = t.getTextValue ?? "textValue", u = r(n) ? e[n] : n(e);
    return u != null ? String(u) : "";
  }, g = (e) => {
    if (e == null)
      return !1;
    const n = t.getDisabled ?? "disabled";
    return (r(n) ? e[n] : n(e)) ?? !1;
  }, d = (e) => {
    if (e != null)
      return r(t.getSectionChildren) ? e[t.getSectionChildren] : t.getSectionChildren?.(e);
  };
  for (const e of t.dataSource) {
    if (r(e) || S(e)) {
      i.push({
        type: "item",
        rawValue: e,
        key: String(e),
        textValue: String(e),
        disabled: g(e),
        level: o,
        index: l
      }), l++;
      continue;
    }
    if (d(e) != null) {
      i.push({
        type: "section",
        rawValue: e,
        key: "",
        // not applicable here
        textValue: "",
        // not applicable here
        disabled: !1,
        // not applicable here
        level: o,
        index: l
      }), l++;
      const n = d(e) ?? [];
      if (n.length > 0) {
        const u = s({
          dataSource: n,
          getKey: t.getKey,
          getTextValue: t.getTextValue,
          getDisabled: t.getDisabled,
          getSectionChildren: t.getSectionChildren,
          startIndex: l,
          startLevel: o + 1
        });
        i.push(...u), l += u.length;
      }
    } else
      i.push({
        type: "item",
        rawValue: e,
        key: f(e),
        textValue: h(e),
        disabled: g(e),
        level: o,
        index: l
      }), l++;
  }
  return i;
}
function b(t, l = []) {
  return x(() => {
    const o = s({
      dataSource: c(t.dataSource),
      getKey: c(t.getKey),
      getTextValue: c(t.getTextValue),
      getDisabled: c(t.getDisabled),
      getSectionChildren: c(t.getSectionChildren)
    });
    for (let i = 0; i < l.length; i++) l[i]();
    return t.factory(o);
  });
}
export {
  b as createCollection
};
//# sourceMappingURL=index188.js.map
