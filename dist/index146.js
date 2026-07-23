import { batch as a } from "solid-js";
import { updateFieldDirty as f } from "./index210.js";
import { initializeFieldStore as n } from "./index211.js";
import { validateIfRequired as p } from "./index212.js";
function v(t, i, r, { shouldTouched: u = !0, shouldDirty: o = !0, shouldValidate: d = !0, shouldFocus: l = !0 } = {}) {
  a(() => {
    const e = n(t, i);
    e.value.set(() => r), u && (e.touched.set(!0), t.internal.touched.set(!0)), o && f(t, e), d && p(t, e, i, {
      on: ["touched", "input"],
      shouldFocus: l
    });
  });
}
export {
  v as setValue
};
//# sourceMappingURL=index146.js.map
