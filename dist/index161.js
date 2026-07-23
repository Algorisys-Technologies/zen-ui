import { createComponent as t, Dynamic as i, mergeProps as n } from "solid-js/web";
import { splitProps as p } from "solid-js";
function a(r) {
  const [o, e] = p(r, ["as"]);
  if (!o.as)
    throw new Error("[kobalte]: Polymorphic is missing the required `as` prop.");
  return (
    // @ts-ignore: Props are valid but not worth calculating
    t(i, n(e, {
      get component() {
        return o.as;
      }
    }))
  );
}
export {
  a as Polymorphic
};
//# sourceMappingURL=index161.js.map
