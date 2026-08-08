const x = ["#DIV/0!", "#VALUE!", "#NAME?", "#CIRCULAR!", "#ERROR!", "#REF!"], a = (t) => typeof t == "string" && x.includes(t), A = (t) => {
  const s = /^\$?([A-Za-z]+)\$?([0-9]+)$/.exec(t.trim());
  if (!s) return null;
  const [, f, e] = s, r = parseInt(e, 10) - 1;
  if (r < 0) return null;
  let c = 0;
  for (const u of f.toUpperCase()) c = c * 26 + (u.charCodeAt(0) - 64);
  return { col: c - 1, row: r };
}, b = (t, s) => {
  let f = "";
  for (let e = t + 1; e > 0; e = Math.floor((e - 1) / 26))
    f = String.fromCharCode(65 + (e - 1) % 26) + f;
  return `${f}${s + 1}`;
}, F = (t) => {
  const [s, f] = t.split(":");
  if (!s || !f) return [];
  const e = A(s), r = A(f);
  if (!e || !r) return [];
  const c = [];
  for (let u = Math.min(e.row, r.row); u <= Math.max(e.row, r.row); u++)
    for (let g = Math.min(e.col, r.col); g <= Math.max(e.col, r.col); g++)
      c.push(b(g, u));
  return c;
}, I = {
  SUM: (t) => t.reduce((s, f) => s + f, 0),
  AVERAGE: (t) => t.length === 0 ? "#DIV/0!" : t.reduce((s, f) => s + f, 0) / t.length,
  MIN: (t) => t.length === 0 ? "#DIV/0!" : Math.min(...t),
  MAX: (t) => t.length === 0 ? "#DIV/0!" : Math.max(...t),
  COUNT: (t) => t.length,
  ABS: (t) => Math.abs(t[0] ?? 0),
  ROUND: (t) => {
    const s = 10 ** Math.trunc(t[1] ?? 0);
    return Math.round((t[0] ?? 0) * s) / s;
  },
  SQRT: (t) => {
    const s = t[0] ?? 0;
    return s < 0 ? "#VALUE!" : Math.sqrt(s);
  }
}, S = (t, s, f = /* @__PURE__ */ new Set()) => {
  if (typeof t != "string" || !t.startsWith("=")) return t;
  const e = t.slice(1);
  let r = 0;
  const c = () => {
    for (; r < e.length && e[r] === " "; ) r++;
  }, u = (n) => {
    const i = n.toUpperCase();
    if (f.has(i)) return "#CIRCULAR!";
    const o = s[i] ?? s[n];
    if (o == null || o === "") return 0;
    const l = typeof o == "string" && o.startsWith("=") ? S(o, s, /* @__PURE__ */ new Set([...f, i])) : o;
    return a(l) ? l : typeof l == "boolean" ? l ? 1 : 0 : typeof l == "number" ? l : "#VALUE!";
  }, g = (n) => {
    if (n.includes(":")) {
      const i = [];
      for (const o of F(n)) {
        const l = o.toUpperCase(), h = s[l];
        if (h == null || h === "" || typeof h == "string" && !h.startsWith("=")) continue;
        const m = u(o);
        if (a(m)) return [m];
        i.push(m);
      }
      return i;
    }
    return [];
  };
  let R = null;
  const E = () => {
    let n = C();
    for (; ; ) {
      c();
      const i = e[r];
      if (i !== "+" && i !== "-") return n;
      r++;
      const o = C();
      if (a(n)) return n;
      if (a(o)) return o;
      n = i === "+" ? n + o : n - o;
    }
  }, C = () => {
    let n = M();
    for (; ; ) {
      c();
      const i = e[r];
      if (i !== "*" && i !== "/") return n;
      r++;
      const o = M();
      if (a(n)) return n;
      if (a(o)) return o;
      if (i === "/" && o === 0) return "#DIV/0!";
      n = i === "*" ? n * o : n / o;
    }
  }, M = () => {
    const n = d();
    if (c(), e[r] !== "^") return n;
    r++;
    const i = M();
    return a(n) ? n : a(i) ? i : n ** i;
  }, d = () => {
    if (c(), e[r] === "-") {
      r++;
      const n = d();
      return a(n) ? n : -n;
    }
    return e[r] === "+" ? (r++, d()) : U();
  }, U = () => {
    if (c(), r >= e.length)
      return R = "#ERROR!", 0;
    if (e[r] === "(") {
      r++;
      const l = E();
      return c(), e[r] !== ")" ? (R = "#ERROR!", 0) : (r++, l);
    }
    const n = /^[0-9]+(\.[0-9]+)?/.exec(e.slice(r));
    if (n)
      return r += n[0].length, parseFloat(n[0]);
    const i = /^\$?[A-Za-z]+\$?[0-9]*/.exec(e.slice(r));
    if (!i)
      return R = "#ERROR!", 0;
    let o = i[0];
    if (r += o.length, c(), e[r] === "(") {
      r++;
      const l = I[o.toUpperCase()], h = [];
      let m = null;
      for (; ; ) {
        if (c(), e[r] === ")") {
          r++;
          break;
        }
        const y = /^\$?[A-Za-z]+\$?[0-9]+:\$?[A-Za-z]+\$?[0-9]+/.exec(e.slice(r));
        if (y) {
          r += y[0].length;
          for (const p of g(y[0]))
            a(p) ? m = p : h.push(p);
        } else {
          const p = E();
          a(p) ? m = p : h.push(p);
        }
        if (c(), e[r] === ",") {
          r++;
          continue;
        }
        if (e[r] === ")") {
          r++;
          break;
        }
        return R = "#ERROR!", 0;
      }
      return l ? m || l(h) : "#NAME?";
    }
    return A(o) ? u(o) : "#NAME?";
  }, w = E();
  return c(), R || r < e.length ? R ?? "#ERROR!" : w;
}, V = (t, s = {}) => {
  if (t == null || t === "") return "";
  if (a(t)) return t;
  if (typeof t == "boolean") return t ? "TRUE" : "FALSE";
  if (typeof t != "number") return String(t);
  const { type: f = "number", decimals: e, currency: r = "USD", locale: c } = s, u = {};
  return e !== void 0 && (u.minimumFractionDigits = e, u.maximumFractionDigits = e), f === "currency" ? new Intl.NumberFormat(c, {
    ...u,
    style: "currency",
    currency: r,
    ...e === void 0 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {}
  }).format(t) : f === "percent" ? new Intl.NumberFormat(c, { ...u, style: "percent" }).format(t) : e !== void 0 ? t.toFixed(e) : String(t);
};
export {
  x as CELL_ERRORS,
  S as evaluateFormula,
  F as expandRange,
  V as formatCellValue,
  b as formatRef,
  a as isCellError,
  A as parseRef
};
//# sourceMappingURL=index105.js.map
