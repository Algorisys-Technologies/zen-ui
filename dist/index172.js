import { createEffect as o, on as s, onCleanup as u } from "solid-js";
function m(t, r) {
  o(s(t, (n) => {
    if (n == null)
      return;
    const e = i(n);
    e != null && (e.addEventListener("reset", r, {
      passive: !0
    }), u(() => {
      e.removeEventListener("reset", r);
    }));
  }));
}
function i(t) {
  return f(t) ? t.form : t.closest("form");
}
function f(t) {
  return t.matches("textarea, input, select, button");
}
export {
  m as createFormResetListener
};
//# sourceMappingURL=index172.js.map
