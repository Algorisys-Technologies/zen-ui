const g = {
  text: ["contains", "notContains", "equals", "notEquals", "starts", "ends", "empty", "notEmpty"],
  number: ["eq", "ne", "gt", "gte", "lt", "lte", "between", "empty", "notEmpty"],
  date: ["eq", "ne", "gt", "gte", "lt", "lte", "between", "empty", "notEmpty"],
  enum: ["in", "notIn", "empty", "notEmpty"],
  boolean: ["isTrue", "isFalse"]
};
function C(t) {
  return g[t];
}
const F = {
  contains: "contains",
  notContains: "does not contain",
  equals: "is",
  notEquals: "is not",
  starts: "starts with",
  ends: "ends with",
  eq: "=",
  ne: "≠",
  gt: ">",
  gte: "≥",
  lt: "<",
  lte: "≤",
  between: "is between",
  in: "is one of",
  notIn: "is none of",
  isTrue: "is yes",
  isFalse: "is no",
  empty: "is empty",
  notEmpty: "is not empty"
}, x = {
  eq: "is on",
  ne: "is not on",
  gt: "is after",
  gte: "is on or after",
  lt: "is before",
  lte: "is on or before"
};
function I(t, i, n) {
  const e = i === "date" && x[t];
  return n ? n(e ? `filter.dateOp.${t}` : `filter.op.${t}`) : e || F[t];
}
function b(t) {
  return t === "empty" || t === "notEmpty" || t === "isTrue" || t === "isFalse" ? 0 : t === "between" ? 2 : t === "in" || t === "notIn" ? "list" : 1;
}
const N = /^\d{4}-\d{2}-\d{2}$/, E = (t, i) => t == null ? !1 : i === "number" ? typeof t == "number" && Number.isFinite(t) : i === "date" ? typeof t == "string" && N.test(t) : Array.isArray(t) ? t.length > 0 : typeof t == "string" && t.trim() !== "";
function O(t, i) {
  const n = i.find((r) => r.id === t.field);
  if (!n || !g[n.type].includes(t.op)) return !1;
  const e = b(t.op);
  return e === 0 ? !0 : e === "list" ? Array.isArray(t.value) && t.value.length > 0 : E(t.value, n.type) ? e === 1 || E(t.valueTo, n.type) : !1;
}
function k(t, i) {
  if (t.kind === "condition") return O(t, i) ? t : null;
  const n = t.children.map((e) => k(e, i)).filter((e) => e !== null);
  return n.length ? { ...t, children: n } : null;
}
function j(t, i, n = (r) => String(r), e) {
  const r = (u, c, y) => e ? e(u, y) : c, o = t ? k(t, i) : null;
  if (!o) return "";
  const f = new Map(i.map((u) => [u.id, u])), p = (u, c) => u.type === "enum" ? u.options?.find((y) => y.value === c)?.label ?? String(c) : u.type === "text" ? r("filter.quoted", `“${String(c).trim()}”`, { text: String(c).trim() }) : n(c, u), h = (u, c) => {
    if (u.kind === "condition") {
      const l = f.get(u.field), s = I(u.op, l.type, e), T = b(u.op), a = l.label;
      if (T === 0) return r("filter.say.none", `${a} ${s}`, { field: a, op: s });
      if (T === "list") {
        const d = u.value.map((A) => p(l, A));
        if (d.length === 1)
          return u.op === "in" ? r("filter.say.isOne", `${a} is ${d[0]}`, { field: a, value: d[0] }) : r("filter.say.isNotOne", `${a} is not ${d[0]}`, { field: a, value: d[0] });
        const $ = d.join(r("filter.listSeparator", ", "));
        return r("filter.say.one", `${a} ${s} ${$}`, { field: a, op: s, value: $ });
      }
      if (T === 2) {
        const d = p(l, u.value), $ = p(l, u.valueTo);
        return r("filter.say.two", `${a} ${s} ${d} and ${$}`, { field: a, op: s, value: d, valueTo: $ });
      }
      const w = p(l, u.value);
      return r("filter.say.one", `${a} ${s} ${w}`, { field: a, op: s, value: w });
    }
    const y = u.children.map((l) => h(l, u.children.length > 1)), v = y.reduce(
      (l, s) => u.join === "and" ? r("filter.say.and", `${l} and ${s}`, { a: l, b: s }) : r("filter.say.or", `${l} or ${s}`, { a: l, b: s })
    );
    return u.not ? r("filter.say.not", `not (${v})`, { clause: v }) : y.length > 1 && c ? `(${v})` : v;
  };
  return h(o, !1);
}
let S = 0;
function q() {
  return S += 1, `f${Date.now().toString(36)}${S.toString(36)}`;
}
function D(t) {
  return { kind: "condition", id: q(), field: t.id, op: g[t.type][0], value: t.type === "enum" ? [] : null };
}
function B(t = "and", i = []) {
  return { kind: "group", id: q(), join: t, children: i };
}
function m(t, i, n) {
  if (t.id === i) return n(t);
  if (t.kind === "condition") return t;
  const e = [];
  let r = !1;
  for (const o of t.children) {
    const f = m(o, i, n);
    f !== o && (r = !0), f && e.push(f);
  }
  return r ? { ...t, children: e } : t;
}
function _(t, i, n) {
  return m(t, i, (e) => e.kind === "group" ? { ...e, children: [...e.children, n] } : e);
}
function G(t, i) {
  return i === t.id ? { ...t, children: [] } : m(t, i, () => null);
}
function M(t, i, n) {
  return m(t, i, (e) => ({ ...e, ...n, id: e.id, kind: e.kind }));
}
function P(t, i, n, e) {
  return m(t, i, (r) => {
    if (r.kind !== "condition") return r;
    const o = e.find((u) => u.id === r.field), f = o?.type === n.type, p = g[n.type].includes(r.op) ? r.op : g[n.type][0], h = f && n.type === "enum" && o?.id === n.id;
    return {
      ...r,
      field: n.id,
      op: p,
      value: f && (n.type !== "enum" || h) ? r.value : n.type === "enum" ? [] : null,
      valueTo: f && n.type !== "enum" ? r.valueTo : null
    };
  });
}
function V(t, i, n) {
  return m(t, i, (e) => {
    if (e.kind !== "condition") return e;
    const r = b(e.op), o = b(n);
    return r === o ? { ...e, op: n } : o === 0 ? { ...e, op: n, value: null, valueTo: null } : o === "list" ? { ...e, op: n, value: [], valueTo: null } : r === "list" || r === 0 ? { ...e, op: n, value: null, valueTo: null } : { ...e, op: n, valueTo: o === 2 ? e.valueTo ?? null : null };
  });
}
export {
  _ as addNode,
  P as changeField,
  V as changeOperator,
  j as describeFilter,
  q as filterId,
  O as isComplete,
  D as newCondition,
  B as newGroup,
  b as operatorArity,
  I as operatorLabel,
  C as operatorsFor,
  k as pruneFilter,
  G as removeNode,
  M as updateNode
};
//# sourceMappingURL=index221.js.map
