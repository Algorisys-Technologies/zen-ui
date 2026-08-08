import * as i from "react";
import { useComposedRefs as b } from "./index192.js";
// @__NO_SIDE_EFFECTS__
function g(t) {
  const e = i.forwardRef((r, l) => {
    let { children: o, ...a } = r, n = null, s = !1;
    const c = [];
    E(o) && typeof d == "function" && (o = d(o._payload)), i.Children.forEach(o, (u) => {
      if (x(u)) {
        s = !0;
        const f = u;
        let p = "child" in f.props ? f.props.child : f.props.children;
        E(p) && typeof d == "function" && (p = d(p._payload)), n = _(f, p), c.push(n?.props?.children);
      } else
        c.push(u);
    }), n ? n = i.cloneElement(n, void 0, c) : (
      // A `Slottable` was found but it didn't resolve to a single element (e.g.
      // it wrapped multiple elements, text, or a render-prop `child` that
      // wasn't an element). Don't fall back to treating the `Slottable` wrapper
      // itself as the slot target — throw a descriptive error below instead.
      !s && i.Children.count(o) === 1 && i.isValidElement(o) && (n = o)
    );
    const y = n ? $(n) : void 0, m = b(l, y);
    if (!n) {
      if (o || o === 0)
        throw new Error(
          s ? V(t) : I(t)
        );
      return o;
    }
    const h = v(a, n.props ?? {});
    return n.type !== i.Fragment && (h.ref = l ? m : y), i.cloneElement(n, h);
  });
  return e.displayName = `${t}.Slot`, e;
}
var L = /* @__PURE__ */ g("Slot"), S = /* @__PURE__ */ Symbol.for("radix.slottable");
// @__NO_SIDE_EFFECTS__
function R(t) {
  const e = (r) => "child" in r ? r.children(r.child) : r.children;
  return e.displayName = `${t}.Slottable`, e.__radixId = S, e;
}
var O = /* @__PURE__ */ R("Slottable"), _ = (t, e) => {
  if ("child" in t.props) {
    const r = t.props.child;
    return i.isValidElement(r) ? i.cloneElement(r, void 0, t.props.children(r.props.children)) : null;
  }
  return i.isValidElement(e) ? e : null;
};
function v(t, e) {
  const r = { ...e };
  for (const l in e) {
    const o = t[l], a = e[l];
    /^on[A-Z]/.test(l) ? o && a ? r[l] = (...s) => {
      const c = a(...s);
      return o(...s), c;
    } : o && (r[l] = o) : l === "style" ? r[l] = { ...o, ...a } : l === "className" && (r[l] = [o, a].filter(Boolean).join(" "));
  }
  return { ...t, ...r };
}
function $(t) {
  let e = Object.getOwnPropertyDescriptor(t.props, "ref")?.get, r = e && "isReactWarning" in e && e.isReactWarning;
  return r ? t.ref : (e = Object.getOwnPropertyDescriptor(t, "ref")?.get, r = e && "isReactWarning" in e && e.isReactWarning, r ? t.props.ref : t.props.ref || t.ref);
}
function x(t) {
  return i.isValidElement(t) && typeof t.type == "function" && "__radixId" in t.type && t.type.__radixId === S;
}
var P = /* @__PURE__ */ Symbol.for("react.lazy");
function E(t) {
  return t != null && typeof t == "object" && "$$typeof" in t && t.$$typeof === P && "_payload" in t && C(t._payload);
}
function C(t) {
  return typeof t == "object" && t !== null && "then" in t;
}
var I = (t) => `${t} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, V = (t) => `${t} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, d = i[" use ".trim().toString()];
export {
  L as Root,
  L as Slot,
  O as Slottable,
  g as createSlot,
  R as createSlottable
};
//# sourceMappingURL=index150.js.map
