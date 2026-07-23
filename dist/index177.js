import { access as o } from "./index206.js";
import { createMemo as h, createSignal as v, createEffect as l, untrack as g, onCleanup as A } from "solid-js";
var E = (r) => {
  const c = h(() => {
    const e = o(r.element);
    if (e)
      return getComputedStyle(e);
  }), m = () => c()?.animationName ?? "none", [s, i] = v(o(r.show) ? "present" : "hidden");
  let d = "none";
  return l((e) => {
    const n = o(r.show);
    return g(() => {
      if (e === n) return n;
      const a = d, t = m();
      n ? i("present") : t === "none" || c()?.display === "none" ? i("hidden") : i(e === !0 && a !== t ? "hiding" : "hidden");
    }), n;
  }), l(() => {
    const e = o(r.element);
    if (!e) return;
    const n = (t) => {
      t.target === e && (d = m());
    }, a = (t) => {
      const f = m().includes(t.animationName);
      t.target === e && f && s() === "hiding" && i("hidden");
    };
    e.addEventListener("animationstart", n), e.addEventListener("animationcancel", a), e.addEventListener("animationend", a), A(() => {
      e.removeEventListener("animationstart", n), e.removeEventListener("animationcancel", a), e.removeEventListener("animationend", a);
    });
  }), {
    present: () => s() === "present" || s() === "hiding",
    state: s,
    setState: i
  };
}, N = E, S = N;
export {
  S as default
};
//# sourceMappingURL=index177.js.map
