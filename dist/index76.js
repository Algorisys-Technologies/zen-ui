import * as p from "react";
const S = 5, E = 1e3;
let e = { toasts: [] };
const n = [], c = /* @__PURE__ */ new Map();
function a(s) {
  e = s, n.forEach((t) => t(e));
}
function d(s) {
  if (c.has(s)) return;
  const t = setTimeout(() => {
    c.delete(s), a({
      ...e,
      toasts: e.toasts.filter((o) => o.id !== s)
    });
  }, E);
  c.set(s, t);
}
function i(s) {
  switch (s.type) {
    case "ADD":
      a({
        ...e,
        toasts: [s.toast, ...e.toasts].slice(0, S)
      });
      break;
    case "UPDATE":
      a({
        ...e,
        toasts: e.toasts.map(
          (t) => t.id === s.toast.id ? { ...t, ...s.toast } : t
        )
      });
      break;
    case "DISMISS": {
      const { id: t } = s;
      t ? d(t) : e.toasts.forEach((o) => d(o.id)), a({
        ...e,
        toasts: e.toasts.map(
          (o) => t === void 0 || o.id === t ? { ...o, open: !1 } : o
        )
      });
      break;
    }
    case "REMOVE":
      s.id === void 0 ? a({ ...e, toasts: [] }) : a({
        ...e,
        toasts: e.toasts.filter((t) => t.id !== s.id)
      });
      break;
  }
}
let u = 0;
const l = () => (u = (u + 1) % Number.MAX_SAFE_INTEGER, String(u));
function m(s) {
  const t = l(), o = (r) => i({ type: "UPDATE", toast: { ...r, id: t } }), f = () => i({ type: "DISMISS", id: t });
  return i({
    type: "ADD",
    toast: {
      ...s,
      id: t,
      open: !0,
      onOpenChange: (r) => {
        r || f();
      }
    }
  }), { id: t, update: o, dismiss: f };
}
function D() {
  const [s, t] = p.useState(e);
  return p.useEffect(() => (n.push(t), () => {
    const o = n.indexOf(t);
    o >= 0 && n.splice(o, 1);
  }), []), {
    toasts: s.toasts,
    toast: m,
    dismiss: (o) => i({ type: "DISMISS", id: o })
  };
}
export {
  m as toast,
  D as useToast
};
//# sourceMappingURL=index76.js.map
