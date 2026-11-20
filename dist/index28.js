const R = (t) => new Date(t.getFullYear(), t.getMonth(), t.getDate()), l = (t) => new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59, 999), c = (t, r) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + r), Y = (t, r) => {
  const n = (t.getDay() - r + 7) % 7;
  return c(R(t), -n);
}, m = (t) => new Date(t.getFullYear(), t.getMonth(), 1), _ = (t) => l(new Date(t.getFullYear(), t.getMonth() + 1, 0)), M = (t) => Math.floor(t.getMonth() / 3), A = (t) => new Date(t.getFullYear(), M(t) * 3, 1), y = (t) => l(new Date(t.getFullYear(), M(t) * 3 + 3, 0)), D = (t, r) => new Date(t.getFullYear(), t.getMonth() + r * 3, 1), S = (t) => new Date(t.getFullYear(), 0, 1), O = (t) => l(new Date(t.getFullYear(), 11, 31)), d = /^(\d{4})-(\d{2})-(\d{2})$/, E = (t) => {
  const r = d.exec(t);
  if (!r) return null;
  const [, n, o, e] = r, s = new Date(Number(n), Number(o) - 1, Number(e));
  return s.getMonth() !== Number(o) - 1 || s.getDate() !== Number(e) ? null : s;
}, X = (t) => {
  const r = (n) => String(n).padStart(2, "0");
  return `${t.getFullYear()}-${r(t.getMonth() + 1)}-${r(t.getDate())}`;
}, F = (t, r, n) => {
  const o = R(r);
  switch (t) {
    case "TODAY":
      return { from: o, to: l(r) };
    case "YESTERDAY":
      return { from: c(o, -1), to: l(c(o, -1)) };
    case "TOMORROW":
      return { from: c(o, 1), to: l(c(o, 1)) };
    case "THIS_WEEK": {
      const e = Y(r, n);
      return { from: e, to: l(c(e, 6)) };
    }
    case "LAST_WEEK": {
      const e = c(Y(r, n), -7);
      return { from: e, to: l(c(e, 6)) };
    }
    case "NEXT_WEEK": {
      const e = c(Y(r, n), 7);
      return { from: e, to: l(c(e, 6)) };
    }
    case "THIS_MONTH":
      return { from: m(r), to: _(r) };
    case "LAST_MONTH": {
      const e = new Date(r.getFullYear(), r.getMonth() - 1, 1);
      return { from: m(e), to: _(e) };
    }
    case "NEXT_MONTH": {
      const e = new Date(r.getFullYear(), r.getMonth() + 1, 1);
      return { from: m(e), to: _(e) };
    }
    case "THIS_QUARTER":
      return { from: A(r), to: y(r) };
    case "LAST_QUARTER": {
      const e = D(A(r), -1);
      return { from: A(e), to: y(e) };
    }
    case "NEXT_QUARTER": {
      const e = D(A(r), 1);
      return { from: A(e), to: y(e) };
    }
    case "THIS_YEAR":
      return { from: S(r), to: O(r) };
    case "LAST_YEAR": {
      const e = new Date(r.getFullYear() - 1, 0, 1);
      return { from: S(e), to: O(e) };
    }
    case "NEXT_YEAR": {
      const e = new Date(r.getFullYear() + 1, 0, 1);
      return { from: S(e), to: O(e) };
    }
    // The *_TO_DATE family is the answer to "but I wanted today included":
    // period start through now, explicitly.
    case "MONTH_TO_DATE":
      return { from: m(r), to: l(r) };
    case "QUARTER_TO_DATE":
      return { from: A(r), to: l(r) };
    case "YEAR_TO_DATE":
      return { from: S(r), to: l(r) };
  }
}, L = (t, r, n, o, e) => {
  const s = Math.max(0, Math.floor(r)), u = R(o), T = t.startsWith("LAST");
  switch (t) {
    case "LAST_DAYS": {
      const a = n ? u : c(u, -1);
      return { from: c(a, -(s - 1)), to: l(a) };
    }
    case "NEXT_DAYS": {
      const a = n ? u : c(u, 1);
      return { from: a, to: l(c(a, s - 1)) };
    }
    case "LAST_WEEKS":
    case "NEXT_WEEKS": {
      const a = Y(o, e);
      if (T) {
        const p = c(a, -7 * s), f = l(n ? c(a, 6) : c(a, -1));
        return { from: p, to: f };
      }
      const i = n ? a : c(a, 7), g = l(c(c(a, 7 * s), 6));
      return { from: i, to: g };
    }
    case "LAST_MONTHS":
    case "NEXT_MONTHS": {
      const a = m(o);
      if (T) {
        const p = new Date(o.getFullYear(), o.getMonth() - s, 1), f = n ? _(o) : l(c(a, -1));
        return { from: p, to: f };
      }
      const i = n ? a : new Date(o.getFullYear(), o.getMonth() + 1, 1), g = _(new Date(o.getFullYear(), o.getMonth() + s, 1));
      return { from: i, to: g };
    }
    case "LAST_QUARTERS":
    case "NEXT_QUARTERS": {
      const a = A(o);
      if (T) {
        const p = D(a, -s), f = n ? y(o) : l(c(a, -1));
        return { from: p, to: f };
      }
      const i = n ? a : D(a, 1), g = y(D(a, s));
      return { from: i, to: g };
    }
    case "LAST_YEARS":
    case "NEXT_YEARS": {
      const a = S(o);
      if (T) {
        const p = new Date(o.getFullYear() - s, 0, 1), f = n ? O(o) : l(c(a, -1));
        return { from: p, to: f };
      }
      const i = n ? a : new Date(o.getFullYear() + 1, 0, 1), g = O(new Date(o.getFullYear() + s, 0, 1));
      return { from: i, to: g };
    }
  }
}, $ = (t, r = /* @__PURE__ */ new Date(), n = {}) => {
  if (!t) return {};
  const o = n.weekStartsOn ?? 0;
  switch (t.operator) {
    case "DATE": {
      const e = E(t.date);
      return e ? { from: R(e), to: l(e) } : {};
    }
    case "FROM": {
      const e = E(t.date);
      return e ? { from: R(e) } : {};
    }
    case "TO": {
      const e = E(t.date);
      return e ? { to: l(e) } : {};
    }
    case "BETWEEN": {
      const e = E(t.from), s = E(t.to);
      if (!e || !s) return {};
      const [u, T] = e <= s ? [e, s] : [s, e];
      return { from: R(u), to: l(T) };
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
], h = new Map(N.map((t) => [t.operator, t])), U = (t) => h.get(t), W = new Set(
  N.filter((t) => t.arity === "count").map((t) => t.operator)
), Q = new Set(
  N.filter((t) => t.arity === "none").map((t) => t.operator)
), b = (t) => W.has(t), x = (t) => Q.has(t), H = (t, r) => `${t} ${r}${t === 1 ? "" : "s"}`, k = (t, r = (o) => o.toLocaleDateString(), n) => {
  if (!t) return "";
  const o = h.get(t.operator), e = (u, T, a) => n ? n(u, a) : T, s = () => o ? e(`dateRange.op.${t.operator}`, o.label) : "";
  if (t.operator === "BETWEEN") {
    const u = E(t.from), T = E(t.to);
    if (!u || !T) return s();
    const [a, i] = u <= T ? [u, T] : [T, u], g = r(a), p = r(i);
    return e("dateRange.span", `${g} – ${p}`, { from: g, to: p });
  }
  if (t.operator === "DATE" || t.operator === "FROM" || t.operator === "TO") {
    const u = E(t.date);
    if (!u) return s();
    const T = r(u);
    return e(`dateRange.at.${t.operator}`, `${o?.label} ${T}`, { date: T });
  }
  if (b(t.operator)) {
    const u = t, T = h.get(u.operator), a = u.operator.startsWith("LAST") ? "Last" : "Next", i = Math.max(0, Math.floor(u.count)), g = e(`dateRange.count.${u.operator}`, `${a} ${H(i, T?.unit ?? "day")}`, { count: i });
    return u.includeCurrent ? e("dateRange.inclCurrent", `${g}, incl. current`, { range: g }) : g;
  }
  return s();
};
export {
  N as DATE_RANGE_OPERATORS,
  k as formatDateRangeValue,
  b as isCountOperator,
  x as isFixedOperator,
  U as operatorMeta,
  E as parseISODate,
  $ as resolveDateRange,
  X as toISODate
};
//# sourceMappingURL=index28.js.map
