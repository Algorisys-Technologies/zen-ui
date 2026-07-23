import { createComponent as g, mergeProps as c, memo as p } from "solid-js/web";
import { createTagName as v } from "./index168.js";
import { Polymorphic as N } from "./index161.js";
import { __export as y } from "./index162.js";
import { mergeDefaultProps as P } from "./index163.js";
import { splitProps as B, createMemo as u } from "solid-js";
import { mergeRefs as T } from "./index166.js";
var _ = {};
y(_, {
  Button: () => I,
  Root: () => d
});
var x = ["button", "color", "file", "image", "reset", "submit"];
function h(r) {
  const e = r.tagName.toLowerCase();
  return e === "button" ? !0 : e === "input" && r.type ? x.indexOf(r.type) !== -1 : !1;
}
function d(r) {
  let e;
  const f = P({
    type: "button"
  }, r), [t, l] = B(f, ["ref", "type", "disabled"]), i = v(() => e, () => "button"), o = u(() => {
    const n = i();
    return n == null ? !1 : h({
      tagName: n,
      type: t.type
    });
  }), a = u(() => i() === "input"), s = u(() => i() === "a" && e?.getAttribute("href") != null);
  return g(N, c({
    as: "button",
    ref(n) {
      var m = T((b) => e = b, t.ref);
      typeof m == "function" && m(n);
    },
    get type() {
      return p(() => !!(o() || a()))() ? t.type : void 0;
    },
    get role() {
      return !o() && !s() ? "button" : void 0;
    },
    get tabIndex() {
      return !o() && !s() && !t.disabled ? 0 : void 0;
    },
    get disabled() {
      return p(() => !!(o() || a()))() ? t.disabled : void 0;
    },
    get "aria-disabled"() {
      return !o() && !a() && t.disabled ? !0 : void 0;
    },
    get "data-disabled"() {
      return t.disabled ? "" : void 0;
    }
  }, l));
}
var I = d;
export {
  I as Button,
  d as ButtonRoot,
  _ as button_exports
};
//# sourceMappingURL=index174.js.map
