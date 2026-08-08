const e = {}, s = {};
function u(t, r) {
  try {
    const n = (e[t] ||= new Intl.DateTimeFormat("en-US", {
      timeZone: t,
      timeZoneName: "longOffset"
    }).format)(r).split("GMT")[1];
    return n in s ? s[n] : o(n, n.split(":"));
  } catch {
    if (t in s) return s[t];
    const f = t?.match(a);
    return f ? o(t, f.slice(1)) : NaN;
  }
}
const a = /([+-]\d\d):?(\d\d)?/;
function o(t, r) {
  const f = +(r[0] || 0), n = +(r[1] || 0), c = +(r[2] || 0) / 60;
  return s[t] = f * 60 + n > 0 ? f * 60 + n + c : f * 60 - n - c;
}
export {
  u as tzOffset
};
//# sourceMappingURL=index317.js.map
