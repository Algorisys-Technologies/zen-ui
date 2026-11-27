import * as p from "react";
const y = 5, M = 1e3;
let o = { toasts: [] };
const d = [], u = /* @__PURE__ */ new Map();
function c(e) {
  o = e, d.forEach((t) => t(o));
}
function E(e) {
  if (u.has(e)) return;
  const t = setTimeout(() => {
    u.delete(e), c({
      ...o,
      toasts: o.toasts.filter((s) => s.id !== e)
    });
  }, M);
  u.set(e, t);
}
function r(e) {
  switch (e.type) {
    case "ADD":
      c({
        ...o,
        toasts: [e.toast, ...o.toasts].slice(0, y)
      });
      break;
    case "UPDATE":
      c({
        ...o,
        toasts: o.toasts.map(
          (t) => t.id === e.toast.id ? { ...t, ...e.toast } : t
        )
      });
      break;
    case "DISMISS": {
      const { id: t } = e;
      t ? E(t) : o.toasts.forEach((s) => E(s.id)), c({
        ...o,
        toasts: o.toasts.map(
          (s) => t === void 0 || s.id === t ? { ...s, open: !1 } : s
        )
      });
      break;
    }
    case "REMOVE":
      e.id === void 0 ? c({ ...o, toasts: [] }) : c({
        ...o,
        toasts: o.toasts.filter((t) => t.id !== e.id)
      });
      break;
  }
}
let S = 0;
const D = () => (S = (S + 1) % Number.MAX_SAFE_INTEGER, String(S));
function v(e, t = D()) {
  const s = (n) => r({ type: "UPDATE", toast: { ...n, id: t } }), i = () => r({ type: "DISMISS", id: t }), a = o.toasts.find((n) => n.id === t);
  if (a?.open)
    return r({
      type: "UPDATE",
      toast: { title: void 0, description: void 0, action: void 0, variant: void 0, duration: void 0, loading: void 0, ...e, id: t }
    }), { id: t, update: s, dismiss: i };
  if (a) {
    const n = u.get(t);
    n && clearTimeout(n), u.delete(t), r({ type: "REMOVE", id: t });
  }
  return r({
    type: "ADD",
    toast: {
      ...e,
      id: t,
      open: !0,
      onOpenChange: (n) => {
        n || i();
      }
    }
  }), { id: t, update: s, dismiss: i };
}
const I = (e) => typeof e != "object" || e === null || p.isValidElement(e);
function f(e, t, s = {}) {
  return v({ title: e, duration: s.duration, ...t }, s.id).id;
}
function h(e, t) {
  return I(e) ? f(e, {}, t) : v(e);
}
const l = Object.assign(h, {
  success: (e, t) => f(e, { variant: "success" }, t),
  error: (e, t) => f(e, { variant: "destructive" }, t),
  /** Sticky until replaced (pass its id to success/error) or dismissed — solid-toast's default. */
  loading: (e, t) => f(e, { loading: !0, duration: t?.duration ?? 1 / 0 }, t),
  /** Close one toast, or every toast with no id. It animates out. */
  dismiss: (e) => r({ type: "DISMISS", id: e }),
  /** Remove at once, with no exit animation. */
  remove: (e) => r({ type: "REMOVE", id: e }),
  /** A loading toast that becomes success or error when the promise settles. Returns the promise. */
  promise: (e, t, s) => {
    const i = l.loading(t.loading, s);
    return e.then(
      (a) => l.success(typeof t.success == "function" ? t.success(a) : t.success, { id: i, duration: s?.duration }),
      (a) => l.error(typeof t.error == "function" ? t.error(a) : t.error, { id: i, duration: s?.duration })
    ), e;
  }
});
function m() {
  const [e, t] = p.useState(o);
  return p.useEffect(() => (d.push(t), () => {
    const s = d.indexOf(t);
    s >= 0 && d.splice(s, 1);
  }), []), {
    toasts: e.toasts,
    toast: l,
    dismiss: (s) => r({ type: "DISMISS", id: s })
  };
}
export {
  l as toast,
  m as useToast
};
//# sourceMappingURL=index84.js.map
