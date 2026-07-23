import { getFilteredNames as m } from "./index217.js";
import { getOptions as y } from "./index218.js";
import { getFieldArrayStore as N } from "./index219.js";
import { getFieldStore as A } from "./index215.js";
function D(r, e, u) {
  const [p, c] = m(r, e), { shouldActive: n = !0, shouldTouched: a = !1, shouldDirty: g = !1, shouldValid: h = !1 } = y(e, u);
  return typeof e != "string" && !Array.isArray(e) ? r.internal.fieldNames.get() : c.forEach((i) => N(r, i).items.get()), p.reduce((i, o) => {
    const t = A(r, o);
    return (!n || t.active.get()) && (!a || t.touched.get()) && (!g || t.dirty.get()) && (!h || !t.error.get()) && (typeof e == "string" ? o.replace(`${e}.`, "") : o).split(".").reduce((s, l, d, f) => s[l] = d === f.length - 1 ? (
      // If it is last key, add value
      t.value.get()
    ) : (
      // Otherwise return object or array
      typeof s[l] == "object" && s[l] || (isNaN(+f[d + 1]) ? {} : [])
    ), i), i;
  }, typeof e == "string" ? [] : {});
}
export {
  D as getValues
};
//# sourceMappingURL=index216.js.map
