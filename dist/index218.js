function a(e) {
  return JSON.stringify(i(e)) ?? "null";
}
function i(e) {
  if (Array.isArray(e)) return e.map(i);
  if (e && typeof e == "object" && !(e instanceof Date)) {
    const t = e;
    return Object.fromEntries(
      Object.keys(t).sort().map((r) => [r, i(t[r])])
    );
  }
  return e;
}
function s(e, t) {
  return a(e) === a(t);
}
function m(e, t, r) {
  return t ? !s(e, t.state) : r !== void 0 && !s(e, r);
}
const f = (e) => e.trim().replace(/\s+/g, " ").toLocaleLowerCase();
function u(e, t, r) {
  const n = f(e);
  if (!n) return "Give the view a name.";
  if (n.length > 80) return "Keep the name under 80 characters.";
  const o = t.find((c) => c.id !== r && f(c.name) === n);
  return o ? `There is already a view called “${o.name}”.` : null;
}
function d(e, t) {
  const r = e.trim().replace(/\s*\(\d+\)$/, "") || "View";
  if (!u(r, t)) return r;
  for (let n = 2; ; n++) {
    const o = `${r} (${n})`;
    if (!u(o, t)) return o;
  }
}
const l = (e) => {
  let t = "";
  for (const r of e) t += String.fromCharCode(r);
  return btoa(t).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
function p(e) {
  return l(new TextEncoder().encode(a({ v: 1, name: e.name, state: e.state })));
}
export {
  p as encodeView,
  d as freeViewName,
  m as isViewModified,
  s as sameViewState,
  a as stableStringify,
  u as viewNameProblem
};
//# sourceMappingURL=index218.js.map
