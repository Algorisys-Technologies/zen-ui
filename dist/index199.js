function b(i) {
  if (i)
    try {
      return Intl.getCanonicalLocales(i), i;
    } catch {
      return;
    }
}
const S = /* @__PURE__ */ new Map();
function A(i) {
  const t = b(i), e = t ?? "", r = S.get(e);
  if (r) return r;
  const u = new Intl.NumberFormat(t, { useGrouping: !0, minimumFractionDigits: 1 }).formatToParts(12345675e-1), f = u.find((a) => a.type === "decimal")?.value ?? ".", o = u.find((a) => a.type === "group")?.value ?? ",", l = new Intl.NumberFormat(t, { useGrouping: !1 }), p = Array.from({ length: 10 }, (a, g) => l.format(g)), d = { decimal: f, group: o, digits: p };
  return S.set(e, d), d;
}
function k(i) {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency: i }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}
function w(i, t) {
  if (!Number.isFinite(i)) return i;
  const e = i < 0 ? -1 : 1, [r, c] = String(Math.abs(i)).split("e"), u = Math.round(+`${r}e${Number(c ?? 0) + t}`), [f, o] = String(u).split("e"), l = +`${f}e${Number(o ?? 0) - t}`;
  return l === 0 ? 0 : e * l;
}
function G(i, t = {}) {
  return new Intl.NumberFormat(b(t.locale), {
    useGrouping: t.grouping ?? !0,
    ...t.precision !== void 0 ? { minimumFractionDigits: t.precision, maximumFractionDigits: t.precision } : { maximumFractionDigits: t.maxPrecision ?? 20 }
  }).format(t.precision !== void 0 ? w(i, t.precision) : i);
}
function E(i, t, e = {}) {
  const r = e.precision ?? k(t), c = w(i, r), u = b(e.locale);
  return e.display === "none" ? new Intl.NumberFormat(u, {
    style: "decimal",
    useGrouping: e.grouping ?? !0,
    minimumFractionDigits: r,
    maximumFractionDigits: r,
    ...e.accounting ? {} : {}
  }).format(c) : new Intl.NumberFormat(u, {
    style: "currency",
    currency: t,
    currencyDisplay: e.display ?? "symbol",
    currencySign: e.accounting ? "accounting" : "standard",
    useGrouping: e.grouping ?? !0,
    minimumFractionDigits: r,
    maximumFractionDigits: r
  }).format(c);
}
const T = {
  k: 1e3,
  thousand: 1e3,
  l: 1e5,
  lac: 1e5,
  lacs: 1e5,
  lakh: 1e5,
  lakhs: 1e5,
  cr: 1e7,
  crore: 1e7,
  crores: 1e7,
  m: 1e6,
  mn: 1e6,
  million: 1e6,
  b: 1e9,
  bn: 1e9,
  billion: 1e9
}, x = /[    ]/g;
function R(i, t = {}) {
  let e = i.replace(/[\u200e\u200f\u061c\u202a-\u202e\u2066-\u2069]/g, "").trim();
  if (e === "") return null;
  if (t.currency) {
    for (const s of ["symbol", "narrowSymbol", "code", "name"])
      try {
        const n = new Intl.NumberFormat(b(t.locale), { style: "currency", currency: t.currency, currencyDisplay: s }), I = new Set([0, 1, 2, 3, 5, 11, 21, 101, 1000.5, 1e6].map((h) => n.formatToParts(h).find((N) => N.type === "currency")?.value ?? ""));
        for (const h of [...I].filter(Boolean).sort((N, P) => P.length - N.length)) e = e.split(h).join(" ");
      } catch {
      }
    e = e.replace(/[\u200e\u200f\u061c]/g, "").trim();
  }
  const { decimal: r, group: c, digits: u } = A(t.locale), f = [u, "٠١٢٣٤٥٦٧٨٩".split(""), "۰۱۲۳۴۵۶۷۸۹".split(""), "०१२३४५६७८९".split("")];
  for (const s of f) for (let n = 0; n < 10; n++) s[n] !== String(n) && (e = e.split(s[n]).join(String(n)));
  e = e.replace(/[−‒–]/g, "-");
  let o = !1;
  const l = /^\((.*)\)$/.exec(e);
  if (l && (o = !0, e = l[1].trim()), e = e.replace(new RegExp("^\\p{Sc}\\s*|\\s*\\p{Sc}$", "gu"), "").replace(/^[A-Z]{3}\s+|\s+[A-Z]{3}$/g, "").trim(), e.startsWith("-")) {
    if (o) return "invalid";
    o = !0, e = e.slice(1).trim();
  } else if (e.endsWith("-")) {
    if (o) return "invalid";
    o = !0, e = e.slice(0, -1).trim();
  }
  e = e.replace(new RegExp("^\\p{Sc}\\s*", "u"), "").trim();
  let p = 1;
  if (t.shorthand) {
    const s = /^(.*?)\s*([a-z]+)\.?$/i.exec(e);
    if (s && s[1] !== "") {
      const n = T[s[2].toLowerCase()];
      if (!n) return "invalid";
      p = n, e = s[1];
    }
  }
  const d = x.test(c);
  x.lastIndex = 0, d && (e = e.replace(x, " "));
  const a = d ? " " : c === "’" || c === "'" ? "['’]" : C(c);
  let g = r;
  !e.includes(r) && r !== "." && c !== "." && /^\d*\.\d+$/.test(e) && (g = "."), !e.includes(r) && r === "," && c === "." && /^\d+\.\d+$/.test(e) && !/^\d{1,3}(\.\d{3})+$/.test(e) && (g = ".");
  const [m, y, D] = e.split(g);
  if (D !== void 0 || y !== void 0 && !/^\d*$/.test(y) || m === "" && (y === void 0 || y === "")) return "invalid";
  let v;
  if (/^\d*$/.test(m)) v = m;
  else {
    const s = new RegExp(`^\\d{1,3}(${a}\\d{3})+$`), n = new RegExp(`^\\d{1,2}(${a}\\d{2})*${a}\\d{3}$`);
    if (!s.test(m) && !n.test(m)) return "invalid";
    v = m.replace(new RegExp(a, "g"), "");
  }
  const $ = +`${v || "0"}.${y || "0"}` * p;
  if (!Number.isFinite($)) return "invalid";
  const F = p === 1 ? $ : w($, 10);
  return o ? F === 0 ? 0 : -F : F;
}
function C(i) {
  return i.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function L(i, t = {}) {
  return i == null || !Number.isFinite(i) ? "" : G(i, { locale: t.locale, grouping: !1, ...t.precision !== void 0 ? { maxPrecision: t.precision } : {} });
}
export {
  k as currencyPrecision,
  L as editText,
  E as formatAmount,
  G as formatNumber,
  A as numberParts,
  R as parseNumber,
  w as roundTo,
  b as validLocale
};
//# sourceMappingURL=index199.js.map
