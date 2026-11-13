import { parseNumber as q } from "./index199.js";
import { makeDate as w, orderForLocale as v } from "./index204.js";
const E = [",", ";", "	", "|"];
function x(r, c = {}) {
  const o = r.replace(/^﻿/, ""), i = c.delimiter ?? L(o), e = [];
  let t = [], n = "", s = !1, l = 0;
  const u = () => {
    t.push(n), n = "", t.length === 1 && t[0] === "" || e.push(t), t = [];
  };
  for (; l < o.length; ) {
    const d = o[l];
    if (s) {
      if (d === '"') {
        if (o[l + 1] === '"') {
          n += '"', l += 2;
          continue;
        }
        s = !1;
      } else n += d;
      l++;
      continue;
    }
    d === '"' && n === "" ? s = !0 : d === i ? (t.push(n), n = "") : d === "\r" ? (u(), o[l + 1] === `
` && l++) : d === `
` ? u() : n += d, l++;
  }
  return (n !== "" || t.length) && u(), e;
}
function L(r) {
  const c = r.replace(/^﻿/, "").split(/\r?\n/).filter((e) => e.trim()).slice(0, 10);
  let o = ",", i = 1;
  for (const e of E) {
    const t = c.map((s) => M(s, e));
    t.length > 0 && t.every((s) => s === t[0]) && t[0] > i && (o = e, i = t[0]);
  }
  return o;
}
function M(r, c) {
  let o = 1, i = !1;
  for (const e of r)
    e === '"' ? i = !i : e === c && !i && o++;
  return o;
}
const b = (r) => r.normalize("NFD").replace(new RegExp("\\p{M}", "gu"), "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
function C(r, c) {
  const o = /* @__PURE__ */ new Set(), i = {};
  for (const e of r) {
    const t = b(e);
    if (!t) continue;
    const n = c.find(
      (s) => !o.has(s.id) && [s.id, s.label, ...s.aliases ?? []].some((l) => b(l) === t)
    );
    n && (i[e] = n.id, o.add(n.id));
  }
  return i;
}
function R(r, c) {
  const o = r.trim(), i = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/.exec(o);
  if (i) return w(+i[1], +i[2], +i[3]);
  const e = o.split(/[/.\-]/);
  if (e.length !== 3 || e.some((u) => !/^\d{1,4}$/.test(u))) return null;
  const t = v(c), [n, s, l] = t === "ymd" ? e : t === "mdy" ? [e[2], e[0], e[1]] : [e[2], e[1], e[0]];
  return n.length !== 4 ? null : w(+n, +s, +l);
}
function I(r, c, o, i = {}) {
  const [e = [], ...t] = o, n = Object.values(r), s = c.filter((a) => a.required && !n.includes(a.id)).map((a) => a.id), l = [...new Set(n.filter((a, m) => n.indexOf(a) !== m))], u = [], d = /* @__PURE__ */ new Set();
  return t.forEach((a, m) => {
    e.forEach((g, y) => {
      const f = c.find((D) => D.id === r[g]);
      if (!f) return;
      const h = (a[y] ?? "").trim();
      let p = null;
      h === "" ? p = f.required ? "required" : null : f.type === "number" && typeof q(h, { locale: i.locale }) != "number" ? p = "number" : f.type === "date" && !R(h, i.locale) && (p = "date"), p && (u.push({ row: m + 1, column: g, field: f.id, kind: p, value: h }), d.add(m));
    });
  }), {
    missing: s,
    duplicates: l,
    cellErrors: u,
    validRows: t.length - d.size,
    totalRows: t.length,
    ok: s.length === 0 && l.length === 0 && u.length === 0
  };
}
export {
  C as autoMap,
  L as detectDelimiter,
  x as parseDelimited,
  R as parseImportDate,
  I as validateMapping
};
//# sourceMappingURL=index146.js.map
