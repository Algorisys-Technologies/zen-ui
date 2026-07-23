import { isString as a } from "./index164.js";
import { createSignal as i, createEffect as m } from "solid-js";
function f(e, t) {
  const [n, o] = i(r(t?.()));
  return m(() => {
    o(e()?.tagName.toLowerCase() || r(t?.()));
  }), n;
}
function r(e) {
  return a(e) ? e : void 0;
}
export {
  f as createTagName
};
//# sourceMappingURL=index169.js.map
