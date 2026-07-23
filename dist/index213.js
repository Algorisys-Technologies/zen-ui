import { untrack as l, batch as y } from "solid-js";
import { focus as A } from "./index204.js";
import { getValues as E } from "./index206.js";
import { setErrorResponse as F } from "./index214.js";
import { getFilteredNames as b } from "./index207.js";
import { getOptions as h } from "./index208.js";
import { getUniqueId as k } from "./index215.js";
import { getFieldStore as w } from "./index205.js";
import { getFieldArrayStore as N } from "./index209.js";
import { updateFormInvalid as P } from "./index216.js";
async function B(t, o, v) {
  const [p, u] = b(t, o), { shouldActive: s = !0, shouldFocus: m = !0 } = h(o, v), f = k();
  t.internal.validators.add(f), t.internal.validating.set(!0);
  const n = t.internal.validate ? await t.internal.validate(l(() => E(t, { shouldActive: s }))) : {};
  let d = typeof o != "string" && !Array.isArray(o) ? !Object.keys(n).length : !0;
  const [g] = await Promise.all([
    // Validate each field in list
    Promise.all(p.map(async (r) => {
      const e = w(t, r);
      if (!s || l(e.active.get)) {
        let i;
        for (const c of e.validate)
          if (i = await c(l(e.value.get)), i)
            break;
        const a = i || n[r] || "";
        return a && (d = !1), e.error.set(a), a ? r : null;
      }
    })),
    // Validate each field array in list
    Promise.all(u.map(async (r) => {
      const e = N(t, r);
      if (!s || l(e.active.get)) {
        let i = "";
        for (const c of e.validate)
          if (i = await c(l(e.items.get)), i)
            break;
        const a = i || n[r] || "";
        a && (d = !1), e.error.set(a);
      }
    }))
  ]);
  return y(() => {
    if (F(t, n, { shouldActive: s }), m) {
      const r = g.find((e) => e);
      r && A(t, r);
    }
    P(t, !d), t.internal.validators.delete(f), t.internal.validators.size || t.internal.validating.set(!1);
  }), d;
}
export {
  B as validate
};
//# sourceMappingURL=index213.js.map
