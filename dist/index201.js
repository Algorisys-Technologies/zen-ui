import { createStore as p, produce as d } from "solid-js/store";
import { ActionType as a } from "./index202.js";
const [T, r] = p({
  toasts: [],
  pausedAt: void 0
}), D = () => {
  const { pausedAt: e, toasts: o } = T;
  if (e)
    return;
  const i = Date.now();
  return o.map((t) => {
    if (t.duration === 1 / 0)
      return;
    const s = (t.duration || 0) + t.pauseDuration - (i - t.createdAt);
    if (s <= 0) {
      t.visible && n({
        type: a.DISMISS_TOAST,
        toastId: t.id
      });
      return;
    }
    return setTimeout(() => {
      n({
        type: a.DISMISS_TOAST,
        toastId: t.id
      });
    }, s);
  });
}, u = /* @__PURE__ */ new Map(), f = (e, o) => {
  if (u.has(e))
    return;
  const i = setTimeout(() => {
    u.delete(e), n({
      type: a.REMOVE_TOAST,
      toastId: e
    });
  }, o);
  u.set(e, i);
}, A = (e) => {
  const o = u.get(e);
  u.delete(e), o && clearTimeout(o);
}, n = (e) => {
  switch (e.type) {
    case a.ADD_TOAST:
      r("toasts", (t) => {
        const s = t;
        return [e.toast, ...s];
      });
      break;
    case a.DISMISS_TOAST:
      const { toastId: o } = e, i = T.toasts;
      if (o) {
        const t = i.find((s) => s.id === o);
        t && f(o, t.unmountDelay), r("toasts", (s) => s.id === o, d((s) => s.visible = !1));
      } else
        i.forEach((t) => {
          f(t.id, t.unmountDelay);
        }), r("toasts", (t) => t.id !== void 0, d((t) => t.visible = !1));
      break;
    case a.REMOVE_TOAST:
      if (!e.toastId) {
        r("toasts", []);
        break;
      }
      r("toasts", (t) => t.filter((S) => S.id !== e.toastId));
      break;
    case a.UPDATE_TOAST:
      e.toast.id && A(e.toast.id), r("toasts", (t) => t.id === e.toast.id, (t) => ({
        ...t,
        ...e.toast
      }));
      break;
    case a.UPSERT_TOAST:
      T.toasts.find((t) => t.id === e.toast.id) ? n({ type: a.UPDATE_TOAST, toast: e.toast }) : n({ type: a.ADD_TOAST, toast: e.toast });
      break;
    case a.START_PAUSE:
      r(d((t) => {
        t.pausedAt = Date.now(), t.toasts.forEach((s) => {
          s.paused = !0;
        });
      }));
      break;
    case a.END_PAUSE:
      const c = e.time - (T.pausedAt || 0);
      r(d((t) => {
        t.pausedAt = void 0, t.toasts.forEach((s) => {
          s.pauseDuration += c, s.paused = !1;
        });
      }));
      break;
  }
};
export {
  D as createTimers,
  n as dispatch,
  T as store
};
//# sourceMappingURL=index201.js.map
