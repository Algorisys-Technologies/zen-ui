import { createRoot as m, createSignal as f, untrack as T } from "solid-js";
import { defaultToastOptions as c, defaultTimeouts as O, defaultToasterOptions as S } from "./index227.js";
import { store as y, dispatch as u } from "./index225.js";
import { generateID as g } from "./index228.js";
import { resolveValue as l } from "./index229.js";
import { ActionType as d } from "./index226.js";
const [a, I] = f(S), A = (t, s = "blank", o) => ({
  ...c,
  ...a().toastOptions,
  ...o,
  type: s,
  message: t,
  pauseDuration: 0,
  createdAt: Date.now(),
  visible: !0,
  id: o.id || g(),
  paused: !1,
  style: {
    ...c.style,
    ...a().toastOptions?.style,
    ...o.style
  },
  duration: o.duration || a().toastOptions?.duration || O[s],
  position: o.position || a().toastOptions?.position || a().position || c.position
}), i = (t) => (s, o = {}) => m(() => {
  const n = y.toasts.find((p) => p.id === o.id), r = A(s, t, { ...n, duration: void 0, ...o });
  return u({ type: d.UPSERT_TOAST, toast: r }), r.id;
}), e = (t, s) => i("blank")(t, s);
T(() => e);
e.error = i("error");
e.success = i("success");
e.loading = i("loading");
e.custom = i("custom");
e.dismiss = (t) => {
  u({
    type: d.DISMISS_TOAST,
    toastId: t
  });
};
e.promise = (t, s, o) => {
  const n = e.loading(s.loading, { ...o });
  return t.then((r) => (e.success(l(s.success, r), {
    id: n,
    ...o
  }), r)).catch((r) => {
    e.error(l(s.error, r), {
      id: n,
      ...o
    });
  }), t;
};
e.remove = (t) => {
  u({
    type: d.REMOVE_TOAST,
    toastId: t
  });
};
export {
  A as createToast,
  a as defaultOpts,
  I as setDefaultOpts,
  e as toast
};
//# sourceMappingURL=index136.js.map
