const S = (t) => new Date(t.getFullYear(), t.getMonth(), t.getDate()), c = (t) => new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59, 999), s = (t, r) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + r), Y = (t, r) => {
  const a = (t.getDay() - r + 7) % 7;
  return s(S(t), -a);
}, R = (t) => new Date(t.getFullYear(), t.getMonth(), 1), m = (t) => c(new Date(t.getFullYear(), t.getMonth() + 1, 0)), M = (t) => Math.floor(t.getMonth() / 3), f = (t) => new Date(t.getFullYear(), M(t) * 3, 1), y = (t) => c(new Date(t.getFullYear(), M(t) * 3 + 3, 0)), D = (t, r) => new Date(t.getFullYear(), t.getMonth() + r * 3, 1), _ = (t) => new Date(t.getFullYear(), 0, 1), O = (t) => c(new Date(t.getFullYear(), 11, 31)), d = /^(\d{4})-(\d{2})-(\d{2})$/, T = (t) => {
  const r = d.exec(t);
  if (!r) return null;
  const [, a, o, e] = r, l = new Date(Number(a), Number(o) - 1, Number(e));
  return l.getMonth() !== Number(o) - 1 || l.getDate() !== Number(e) ? null : l;
}, X = (t) => {
  const r = (a) => String(a).padStart(2, "0");
  return `${t.getFullYear()}-${r(t.getMonth() + 1)}-${r(t.getDate())}`;
}, F = (t, r, a) => {
  const o = S(r);
  switch (t) {
    case "TODAY":
      return { from: o, to: c(r) };
    case "YESTERDAY":
      return { from: s(o, -1), to: c(s(o, -1)) };
    case "TOMORROW":
      return { from: s(o, 1), to: c(s(o, 1)) };
    case "THIS_WEEK": {
      const e = Y(r, a);
      return { from: e, to: c(s(e, 6)) };
    }
    case "LAST_WEEK": {
      const e = s(Y(r, a), -7);
      return { from: e, to: c(s(e, 6)) };
    }
    case "NEXT_WEEK": {
      const e = s(Y(r, a), 7);
      return { from: e, to: c(s(e, 6)) };
    }
    case "THIS_MONTH":
      return { from: R(r), to: m(r) };
    case "LAST_MONTH": {
      const e = new Date(r.getFullYear(), r.getMonth() - 1, 1);
      return { from: R(e), to: m(e) };
    }
    case "NEXT_MONTH": {
      const e = new Date(r.getFullYear(), r.getMonth() + 1, 1);
      return { from: R(e), to: m(e) };
    }
    case "THIS_QUARTER":
      return { from: f(r), to: y(r) };
    case "LAST_QUARTER": {
      const e = D(f(r), -1);
      return { from: f(e), to: y(e) };
    }
    case "NEXT_QUARTER": {
      const e = D(f(r), 1);
      return { from: f(e), to: y(e) };
    }
    case "THIS_YEAR":
      return { from: _(r), to: O(r) };
    case "LAST_YEAR": {
      const e = new Date(r.getFullYear() - 1, 0, 1);
      return { from: _(e), to: O(e) };
    }
    case "NEXT_YEAR": {
      const e = new Date(r.getFullYear() + 1, 0, 1);
      return { from: _(e), to: O(e) };
    }
    // The *_TO_DATE family is the answer to "but I wanted today included":
    // period start through now, explicitly.
    case "MONTH_TO_DATE":
      return { from: R(r), to: c(r) };
    case "QUARTER_TO_DATE":
      return { from: f(r), to: c(r) };
    case "YEAR_TO_DATE":
      return { from: _(r), to: c(r) };
  }
}, L = (t, r, a, o, e) => {
  const l = Math.max(0, Math.floor(r)), u = S(o), A = t.startsWith("LAST");
  switch (t) {
    case "LAST_DAYS": {
      const n = a ? u : s(u, -1);
      return { from: s(n, -(l - 1)), to: c(n) };
    }
    case "NEXT_DAYS": {
      const n = a ? u : s(u, 1);
      return { from: n, to: c(s(n, l - 1)) };
    }
    case "LAST_WEEKS":
    case "NEXT_WEEKS": {
      const n = Y(o, e);
      if (A) {
        const p = s(n, -7 * l), E = c(a ? s(n, 6) : s(n, -1));
        return { from: p, to: E };
      }
      const i = a ? n : s(n, 7), g = c(s(s(n, 7 * l), 6));
      return { from: i, to: g };
    }
    case "LAST_MONTHS":
    case "NEXT_MONTHS": {
      const n = R(o);
      if (A) {
        const p = new Date(o.getFullYear(), o.getMonth() - l, 1), E = a ? m(o) : c(s(n, -1));
        return { from: p, to: E };
      }
      const i = a ? n : new Date(o.getFullYear(), o.getMonth() + 1, 1), g = m(new Date(o.getFullYear(), o.getMonth() + l, 1));
      return { from: i, to: g };
    }
    case "LAST_QUARTERS":
    case "NEXT_QUARTERS": {
      const n = f(o);
      if (A) {
        const p = D(n, -l), E = a ? y(o) : c(s(n, -1));
        return { from: p, to: E };
      }
      const i = a ? n : D(n, 1), g = y(D(n, l));
      return { from: i, to: g };
    }
    case "LAST_YEARS":
    case "NEXT_YEARS": {
      const n = _(o);
      if (A) {
        const p = new Date(o.getFullYear() - l, 0, 1), E = a ? O(o) : c(s(n, -1));
        return { from: p, to: E };
      }
      const i = a ? n : new Date(o.getFullYear() + 1, 0, 1), g = O(new Date(o.getFullYear() + l, 0, 1));
      return { from: i, to: g };
    }
  }
}, U = (t, r = /* @__PURE__ */ new Date(), a = {}) => {
  if (!t) return {};
  const o = a.weekStartsOn ?? 0;
  switch (t.operator) {
    case "DATE": {
      const e = T(t.date);
      return e ? { from: S(e), to: c(e) } : {};
    }
    case "FROM": {
      const e = T(t.date);
      return e ? { from: S(e) } : {};
    }
    case "TO": {
      const e = T(t.date);
      return e ? { to: c(e) } : {};
    }
    case "BETWEEN": {
      const e = T(t.from), l = T(t.to);
      if (!e || !l) return {};
      const [u, A] = e <= l ? [e, l] : [l, e];
      return { from: S(u), to: c(A) };
    }
    default: {
      if (b(t.operator)) {
        const e = t;
        return L(e.operator, e.count, e.includeCurrent ?? !1, r, o);
      }
      return x(t.operator) ? F(t.operator, r, o) : {};
    }
  }
}, N = [
  { operator: "TODAY", label: "Today", arity: "none", group: "Day" },
  { operator: "YESTERDAY", label: "Yesterday", arity: "none", group: "Day" },
  { operator: "TOMORROW", label: "Tomorrow", arity: "none", group: "Day" },
  { operator: "THIS_WEEK", label: "This week", arity: "none", group: "Week" },
  { operator: "LAST_WEEK", label: "Last week", arity: "none", group: "Week" },
  { operator: "NEXT_WEEK", label: "Next week", arity: "none", group: "Week" },
  { operator: "THIS_MONTH", label: "This month", arity: "none", group: "Month" },
  { operator: "LAST_MONTH", label: "Last month", arity: "none", group: "Month" },
  { operator: "NEXT_MONTH", label: "Next month", arity: "none", group: "Month" },
  { operator: "MONTH_TO_DATE", label: "Month to date", arity: "none", group: "Month" },
  { operator: "THIS_QUARTER", label: "This quarter", arity: "none", group: "Quarter" },
  { operator: "LAST_QUARTER", label: "Last quarter", arity: "none", group: "Quarter" },
  { operator: "NEXT_QUARTER", label: "Next quarter", arity: "none", group: "Quarter" },
  { operator: "QUARTER_TO_DATE", label: "Quarter to date", arity: "none", group: "Quarter" },
  { operator: "THIS_YEAR", label: "This year", arity: "none", group: "Year" },
  { operator: "LAST_YEAR", label: "Last year", arity: "none", group: "Year" },
  { operator: "NEXT_YEAR", label: "Next year", arity: "none", group: "Year" },
  { operator: "YEAR_TO_DATE", label: "Year to date", arity: "none", group: "Year" },
  { operator: "LAST_DAYS", label: "Last…days", arity: "count", group: "Rolling", unit: "day" },
  { operator: "NEXT_DAYS", label: "Next…days", arity: "count", group: "Rolling", unit: "day" },
  { operator: "LAST_WEEKS", label: "Last…weeks", arity: "count", group: "Rolling", unit: "week" },
  { operator: "NEXT_WEEKS", label: "Next…weeks", arity: "count", group: "Rolling", unit: "week" },
  { operator: "LAST_MONTHS", label: "Last…months", arity: "count", group: "Rolling", unit: "month" },
  { operator: "NEXT_MONTHS", label: "Next…months", arity: "count", group: "Rolling", unit: "month" },
  { operator: "LAST_QUARTERS", label: "Last…quarters", arity: "count", group: "Rolling", unit: "quarter" },
  { operator: "NEXT_QUARTERS", label: "Next…quarters", arity: "count", group: "Rolling", unit: "quarter" },
  { operator: "LAST_YEARS", label: "Last…years", arity: "count", group: "Rolling", unit: "year" },
  { operator: "NEXT_YEARS", label: "Next…years", arity: "count", group: "Rolling", unit: "year" },
  { operator: "DATE", label: "On", arity: "date", group: "Fixed" },
  { operator: "FROM", label: "From", arity: "date", group: "Fixed" },
  { operator: "TO", label: "Until", arity: "date", group: "Fixed" },
  { operator: "BETWEEN", label: "Between", arity: "range", group: "Fixed" }
], h = new Map(N.map((t) => [t.operator, t])), $ = (t) => h.get(t), W = new Set(
  N.filter((t) => t.arity === "count").map((t) => t.operator)
), Q = new Set(
  N.filter((t) => t.arity === "none").map((t) => t.operator)
), b = (t) => W.has(t), x = (t) => Q.has(t), H = (t, r) => `${t} ${r}${t === 1 ? "" : "s"}`, k = (t, r = (a) => a.toLocaleDateString()) => {
  if (!t) return "";
  const a = h.get(t.operator);
  if (t.operator === "BETWEEN") {
    const o = T(t.from), e = T(t.to);
    if (!o || !e) return a?.label ?? "";
    const [l, u] = o <= e ? [o, e] : [e, o];
    return `${r(l)} – ${r(u)}`;
  }
  if (t.operator === "DATE" || t.operator === "FROM" || t.operator === "TO") {
    const o = T(t.date);
    return o ? `${a?.label} ${r(o)}` : a?.label ?? "";
  }
  if (b(t.operator)) {
    const o = t, e = h.get(o.operator), u = `${o.operator.startsWith("LAST") ? "Last" : "Next"} ${H(Math.max(0, Math.floor(o.count)), e?.unit ?? "day")}`;
    return o.includeCurrent ? `${u}, incl. current` : u;
  }
  return a?.label ?? "";
};
export {
  N as DATE_RANGE_OPERATORS,
  k as formatDateRangeValue,
  b as isCountOperator,
  x as isFixedOperator,
  $ as operatorMeta,
  T as parseISODate,
  U as resolveDateRange,
  X as toISODate
};
//# sourceMappingURL=index25.js.map
