import { asArray as c, access as o, tryOnCleanup as a } from "./index166.js";
import { createEffect as m, createRenderEffect as E } from "solid-js";
import { isServer as u } from "solid-js/web";
function v(e, r, n, t) {
  return e.addEventListener(r, n, t), a(e.removeEventListener.bind(e, r, n, t));
}
function h(e, r, n, t) {
  if (u)
    return;
  const f = () => {
    c(o(e)).forEach((i) => {
      i && c(o(r)).forEach((s) => v(i, s, n, t));
    });
  };
  typeof e == "function" ? m(f) : E(f);
}
export {
  h as createEventListener,
  v as makeEventListener
};
//# sourceMappingURL=index189.js.map
