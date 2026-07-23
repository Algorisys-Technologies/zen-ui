import { getDocument as t, EventKey as r } from "./index160.js";
import { createEffect as c, onCleanup as i } from "solid-js";
import { isServer as m } from "solid-js/web";
import { access as a } from "./index178.js";
function y(n) {
  const o = (e) => {
    e.key === r.Escape && n.onEscapeKeyDown?.(e);
  };
  c(() => {
    if (m || a(n.isDisabled))
      return;
    const e = n.ownerDocument?.() ?? t();
    e.addEventListener("keydown", o), i(() => {
      e.removeEventListener("keydown", o);
    });
  });
}
export {
  y as createEscapeKeyDown
};
//# sourceMappingURL=index187.js.map
