import "solid-js";
const i = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g;
function r(e) {
  const t = {};
  let n;
  for (; n = i.exec(e); )
    t[n[1]] = n[2];
  return t;
}
function c(e, t) {
  if (typeof e == "string") {
    if (typeof t == "string")
      return `${e};${t}`;
    e = r(e);
  } else typeof t == "string" && (t = r(t));
  return { ...e, ...t };
}
export {
  c as combineStyle,
  r as stringStyleToObject
};
//# sourceMappingURL=index167.js.map
