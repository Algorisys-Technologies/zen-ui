import { untrack as o, batch as e } from "solid-js";
import { isFieldDirty as a } from "./index240.js";
import { updateFormDirty as m } from "./index241.js";
function c(i, t) {
  o(() => {
    const r = a(t.startValue.get(), t.value.get());
    r !== t.dirty.get() && e(() => {
      t.dirty.set(r), m(i, r);
    });
  });
}
export {
  c as updateFieldDirty
};
//# sourceMappingURL=index220.js.map
