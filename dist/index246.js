function c(t) {
  if (!Number.isFinite(t)) return 0;
  const e = String(Math.abs(t)), n = e.indexOf("e");
  if (n >= 0) {
    const r = e.slice(0, n), u = Number(e.slice(n + 1)), i = r.includes(".") ? r.split(".")[1].length : 0;
    return Math.max(0, i - u);
  }
  return e.includes(".") ? e.split(".")[1].length : 0;
}
const a = (t) => t == null || t === "" || typeof t == "number" && Number.isNaN(t);
function o(t) {
  const e = [];
  for (const n of t) typeof n == "number" && Number.isFinite(n) && e.push(n);
  return e;
}
function s(t) {
  if (t.length === 0) return 0;
  if (t.some((i) => Math.abs(i) >= 1e21)) return t.reduce((i, l) => i + l, 0);
  const e = Math.min(20, Math.max(...t.map(c)));
  let n = 0n;
  for (const i of t) n += BigInt(i.toFixed(e).replace(".", ""));
  if (e === 0) return Number(n);
  const r = n < 0n, u = (r ? -n : n).toString().padStart(e + 1, "0");
  return +`${r ? "-" : ""}${u.slice(0, -e)}.${u.slice(-e)}`;
}
const f = (t) => typeof t == "number" ? Number.isFinite(t) ? t : null : t instanceof Date ? Number.isNaN(t.getTime()) ? null : t.getTime() : typeof t == "string" ? t === "" ? null : t : null;
function m(t, e) {
  switch (e) {
    case "count":
      return t.filter((n) => !a(n)).length;
    case "sum": {
      const n = o(t);
      return n.length ? s(n) : null;
    }
    case "avg": {
      const n = o(t);
      return n.length ? s(n) / n.length : null;
    }
    case "min":
    case "max": {
      let n = null, r = null;
      for (const u of t) {
        const i = f(u);
        i !== null && (r !== null && typeof i != typeof r || (r === null || (e === "min" ? i < r : i > r)) && (n = u, r = i));
      }
      return n;
    }
  }
}
function g(t, e, n = 6) {
  if (e === "count") return 0;
  const r = Math.min(n, Math.max(0, ...o(t).map(c)));
  return e === "avg" ? Math.max(2, r) : r;
}
export {
  m as aggregate,
  c as decimalsOf,
  s as exactSum,
  o as numbersOf,
  g as totalPrecision
};
//# sourceMappingURL=index246.js.map
