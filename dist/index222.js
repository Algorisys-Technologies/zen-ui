import { untrack as d } from "solid-js";
import { validate as o } from "./index223.js";
function u(t, a, n, { on: i, shouldFocus: l = !1 }) {
  d(() => {
    const e = a.validateOn ?? t.internal.validateOn, v = a.revalidateOn ?? t.internal.revalidateOn;
    i.includes((e === "submit" ? t.internal.submitted.get() : a.error.get()) ? v : e) && o(t, n, { shouldFocus: l });
  });
}
export {
  u as validateIfRequired
};
//# sourceMappingURL=index222.js.map
