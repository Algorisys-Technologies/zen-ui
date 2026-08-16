import u from "react";
var Z = (e) => e.type === "checkbox", x = (e) => e instanceof Date, S = (e) => e == null;
const G = (e) => typeof e == "object";
var F = (e) => !S(e) && !Array.isArray(e) && G(e) && !x(e), I = (e) => F(e) && e.target ? Z(e.target) ? e.target.checked : e.target.value : e, j = (e, n) => n.split(".").some((t, s, r) => !isNaN(Number(t)) && e.has(r.slice(0, s).join("."))), K = (e) => {
  const n = e.constructor && e.constructor.prototype;
  return F(n) && n.hasOwnProperty("isPrototypeOf");
}, Y = typeof window < "u" && typeof window.HTMLElement < "u" && typeof document < "u";
function q(e) {
  if (e instanceof Date)
    return new Date(e);
  const n = typeof FileList < "u" && e instanceof FileList;
  if (Y && (e instanceof Blob || n))
    return e;
  const t = Array.isArray(e);
  if (!t && !(F(e) && K(e)))
    return e;
  const s = t ? [] : Object.create(Object.getPrototypeOf(e));
  for (const r in e)
    Object.prototype.hasOwnProperty.call(e, r) && (s[r] = q(e[r]));
  return s;
}
const L = {
  BLUR: "blur",
  CHANGE: "change"
}, T = {
  all: "all"
}, z = ["__proto__", "constructor", "prototype"], ee = /^\w*$/;
var $ = (e) => ee.test(e), N = (e) => e === void 0;
const te = /[.[\]'"]/;
var J = (e) => e.split(te).filter(Boolean), m = (e, n, t) => {
  if (!n || !F(e))
    return t;
  const s = $(n) ? [n] : J(n);
  if (s.some((o) => z.includes(o)))
    return t;
  const r = s.reduce((o, a) => S(o) ? void 0 : o[a], e);
  return N(r) || r === e ? N(e[n]) ? t : e[n] : r;
}, R = (e) => typeof e == "boolean", E = (e) => typeof e == "function", B = (e, n, t) => {
  let s = -1;
  const r = $(n) ? [n] : J(n), o = r.length, a = o - 1;
  for (; ++s < o; ) {
    const c = r[s];
    let i = t;
    if (s !== a) {
      const f = e[c];
      i = F(f) || Array.isArray(f) ? f : isNaN(+r[s + 1]) ? {} : [];
    }
    if (z.includes(c))
      return;
    e[c] = i, e = e[c];
  }
};
const w = u.createContext(null);
w.displayName = "HookFormControlContext";
const M = () => u.useContext(w);
var re = (e, n, t, s = !0) => {
  const r = {};
  for (const o in e)
    Object.defineProperty(r, o, {
      get: () => {
        const a = o;
        return n._proxyFormState[a] !== T.all && (n._proxyFormState[a] = !s || T.all), t && (t[a] = !0), e[a];
      }
    });
  return r;
};
const Q = Y ? u.useLayoutEffect : u.useEffect;
function ne(e) {
  const n = M(), { control: t = n, disabled: s, name: r, exact: o } = e || {}, [a, c] = u.useState(() => ({
    ...t._formState,
    defaultValues: t._defaultValues
  })), i = u.useRef({
    isDirty: !1,
    isLoading: !1,
    dirtyFields: !1,
    touchedFields: !1,
    validatingFields: !1,
    isValidating: !1,
    isValid: !1,
    errors: !1
  });
  return Q(() => t._subscribe({
    name: r,
    formState: i.current,
    exact: o,
    callback: (f) => {
      !s && c({
        ...t._formState,
        ...f,
        defaultValues: t._defaultValues
      });
    }
  }), [r, s, o]), u.useEffect(() => {
    i.current.isValid && t._setValid(!0);
  }, [t]), u.useMemo(() => re(a, t, i.current, !1), [a, t]);
}
var se = (e) => typeof e == "string", H = (e, n, t, s, r) => se(e) ? m(t, e, r) : Array.isArray(e) ? e.map((o) => m(t, o)) : t, U = (e) => S(e) || !G(e);
const W = (e, n) => n.length === 0 && !Array.isArray(e) && !K(e);
function b(e, n, t = /* @__PURE__ */ new WeakMap()) {
  if (e === n)
    return !0;
  if (U(e) || U(n))
    return Object.is(e, n);
  if (x(e) && x(n))
    return Object.is(e.getTime(), n.getTime());
  const s = Object.keys(e), r = Object.keys(n);
  if (s.length !== r.length)
    return !1;
  if (W(e, s) || W(n, r))
    return Object.is(e, n);
  if (!s.length && Array.isArray(e) !== Array.isArray(n))
    return !1;
  const o = t.get(e);
  if (o && o.has(n))
    return !0;
  if (o)
    o.add(n);
  else {
    const a = /* @__PURE__ */ new WeakSet();
    a.add(n), t.set(e, a);
  }
  for (const a of s) {
    const c = e[a];
    if (!(a in n))
      return !1;
    if (a !== "ref") {
      const i = n[a];
      if (x(c) && x(i) || (F(c) || Array.isArray(c)) && (F(i) || Array.isArray(i)) ? !b(c, i, t) : !Object.is(c, i))
        return !1;
    }
  }
  return !0;
}
function ue(e) {
  const n = M(), { control: t = n, name: s, defaultValue: r, disabled: o, exact: a, compute: c } = e || {}, i = u.useRef(r), f = u.useRef(c), g = u.useRef(void 0), d = u.useRef(t), p = u.useRef(s);
  f.current = c;
  const [V, C] = u.useState(() => {
    const l = t._getWatch(s, i.current);
    return f.current ? f.current(l) : l;
  }), h = u.useCallback((l) => {
    const y = H(s, t._names, l || t._formValues, !1, i.current);
    return f.current ? f.current(y) : y;
  }, [t._formValues, t._names, s]), v = u.useCallback((l) => {
    if (!o) {
      const y = H(s, t._names, l || t._formValues, !1, i.current);
      if (f.current) {
        const _ = f.current(y);
        b(_, g.current) || (C(_), g.current = _);
      } else
        C(y);
    }
  }, [t._formValues, t._names, o, s]);
  Q(() => ((d.current !== t || !b(p.current, s)) && (d.current = t, p.current = s, v()), t._subscribe({
    name: s,
    formState: {
      values: !0
    },
    exact: a,
    callback: (l) => {
      v(l.values);
    }
  })), [t, a, s, v]), u.useEffect(() => t._removeUnmounted());
  const O = d.current !== t, A = p.current, k = u.useMemo(() => {
    if (o)
      return null;
    const l = !O && !b(A, s);
    return O || l ? h() : null;
  }, [o, O, s, A, h]);
  return k !== null ? k : V;
}
function oe(e) {
  const n = M(), { name: t, disabled: s, control: r = n, shouldUnregister: o, defaultValue: a, exact: c = !0 } = e, i = j(r._names.array, t), f = u.useMemo(() => m(r._formValues, t, m(r._defaultValues, t, a)), [r, t, a]), g = ue({
    control: r,
    name: t,
    defaultValue: f,
    exact: c
  }), d = ne({
    control: r,
    name: t,
    exact: c
  }), p = u.useRef(e), V = u.useRef(null), C = u.useRef(r.register(t, {
    ...e.rules,
    value: g,
    ...R(e.disabled) ? { disabled: e.disabled } : {}
  }));
  p.current = e;
  const h = u.useMemo(() => Object.defineProperties({}, {
    invalid: {
      enumerable: !0,
      get: () => !!m(d.errors, t)
    },
    isDirty: {
      enumerable: !0,
      get: () => !!m(d.dirtyFields, t)
    },
    isTouched: {
      enumerable: !0,
      get: () => !!m(d.touchedFields, t)
    },
    isValidating: {
      enumerable: !0,
      get: () => !!m(d.validatingFields, t)
    },
    error: {
      enumerable: !0,
      get: () => m(d.errors, t)
    }
  }), [d, t]), v = u.useCallback((l) => {
    const y = I(l);
    return m(r._fields, t) || (C.current = r.register(t, {
      ...p.current.rules,
      value: y
    })), C.current.onChange({
      target: {
        value: I(l),
        name: t
      },
      type: L.CHANGE
    });
  }, [t, r]), O = u.useCallback(() => C.current.onBlur({
    target: {
      value: m(r._formValues, t),
      name: t
    },
    type: L.BLUR
  }), [t, r._formValues]), A = u.useCallback((l) => {
    l && (V.current = {
      focus: () => E(l.focus) && l.focus(),
      select: () => E(l.select) && l.select(),
      setCustomValidity: (_) => E(l.setCustomValidity) && l.setCustomValidity(_),
      reportValidity: () => E(l.reportValidity) && l.reportValidity()
    });
    const y = m(r._fields, t);
    y && y._f && l && (y._f.ref = V.current);
  }, [r._fields, t]), k = u.useMemo(() => ({
    name: t,
    value: g,
    ...R(s) || d.disabled ? { disabled: d.disabled || s } : {},
    onChange: v,
    onBlur: O,
    ref: A
  }), [t, s, d.disabled, v, O, A, g]);
  return u.useEffect(() => {
    const l = r._options.shouldUnregister || o;
    r.register(t, {
      ...p.current.rules,
      ...R(p.current.disabled) ? { disabled: p.current.disabled } : {}
    });
    const y = (_, X) => {
      const P = m(r._fields, _);
      P && P._f && (P._f.mount = X);
    };
    if (y(t, !0), l) {
      const _ = q(m(o ? r._defaultValues : r._options.values || r._defaultValues, t, m(r._options.defaultValues, t, p.current.defaultValue)));
      B(r._defaultValues, t, _), N(m(r._formValues, t)) && B(r._formValues, t, _);
    }
    if (!i && r.register(t), V.current) {
      const _ = m(r._fields, t);
      _ && _._f && (_._f.ref = V.current);
    }
    return () => {
      (i ? l && !r._state.action : l) ? r.unregister(t) : y(t, !1);
    };
  }, [t, r, i, o]), u.useEffect(() => {
    r._setDisabledField({
      disabled: s,
      name: t
    });
  }, [s, t, r]), u.useMemo(() => ({
    field: k,
    formState: d,
    fieldState: h
  }), [k, d, h]);
}
const le = (e) => e.render(oe(e)), D = u.createContext(null);
D.displayName = "HookFormContext";
const ie = () => u.useContext(D), ce = ({ children: e, watch: n, getValues: t, getFieldState: s, setError: r, clearErrors: o, setValue: a, setValues: c, trigger: i, formState: f, resetField: g, reset: d, handleSubmit: p, unregister: V, control: C, register: h, setFocus: v, subscribe: O }) => {
  const A = u.useMemo(() => ({
    watch: n,
    getValues: t,
    getFieldState: s,
    setError: r,
    clearErrors: o,
    setValue: a,
    setValues: c,
    trigger: i,
    formState: f,
    resetField: g,
    reset: d,
    handleSubmit: p,
    unregister: V,
    control: C,
    register: h,
    setFocus: v,
    subscribe: O
  }), [
    o,
    C,
    f,
    s,
    t,
    p,
    h,
    d,
    g,
    r,
    v,
    a,
    c,
    O,
    i,
    V,
    n
  ]);
  return u.createElement(
    D.Provider,
    { value: A },
    u.createElement(w.Provider, { value: A.control }, e)
  );
};
export {
  le as Controller,
  ce as FormProvider,
  m as get,
  B as set,
  oe as useController,
  ie as useFormContext,
  ne as useFormState,
  ue as useWatch
};
//# sourceMappingURL=index169.js.map
