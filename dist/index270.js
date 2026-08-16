import { useRef as E, useLayoutEffect as z } from "react";
import { Animation as o } from "./index269.js";
const l = (e) => e instanceof HTMLElement ? e : null, k = (e) => [
  ...e.querySelectorAll("[data-animated-month]") ?? []
], I = (e) => l(e.querySelector("[data-animated-month]")), q = (e) => l(e.querySelector("[data-animated-caption]")), w = (e) => l(e.querySelector("[data-animated-weeks]")), B = (e) => l(e.querySelector("[data-animated-nav]")), P = (e) => l(e.querySelector("[data-animated-weekdays]"));
function D(e, M, { classNames: s, months: a, focused: b, dateLib: h }) {
  const y = E(null), S = E(a), p = E(!1);
  z(() => {
    const f = S.current;
    if (S.current = a, !M || !e.current || // safety check because the ref can be set to anything by consumers
    !(e.current instanceof HTMLElement) || // validation required for the animation to work as expected
    a.length === 0 || f.length === 0 || a.length !== f.length)
      return;
    const g = h.isSameMonth(a[0].date, f[0].date), u = h.isAfter(a[0].date, f[0].date), v = u ? s[o.caption_after_enter] : s[o.caption_before_enter], m = u ? s[o.weeks_after_enter] : s[o.weeks_before_enter], A = y.current, L = e.current.cloneNode(!0);
    if (L instanceof HTMLElement ? (k(L).forEach((t) => {
      if (!(t instanceof HTMLElement))
        return;
      const c = I(t);
      c && t.contains(c) && t.removeChild(c);
      const n = q(t);
      n && n.classList.remove(v);
      const r = w(t);
      r && r.classList.remove(m);
    }), y.current = L) : y.current = null, p.current || g || // skip animation if a day is focused because it can cause issues to the animation and is better for a11y
    b)
      return;
    const H = A instanceof HTMLElement ? k(A) : [], x = k(e.current);
    if (x?.every((i) => i instanceof HTMLElement) && H?.every((i) => i instanceof HTMLElement)) {
      p.current = !0, e.current.style.isolation = "isolate";
      const i = B(e.current);
      i && (i.style.zIndex = "1"), x.forEach((t, c) => {
        const n = H[c];
        if (!n)
          return;
        t.style.position = "relative", t.style.overflow = "hidden";
        const r = q(t);
        r && r.classList.add(v);
        const d = w(t);
        d && d.classList.add(m);
        const W = () => {
          p.current = !1, e.current && (e.current.style.isolation = ""), i && (i.style.zIndex = ""), r && r.classList.remove(v), d && d.classList.remove(m), t.style.position = "", t.style.overflow = "", t.contains(n) && t.removeChild(n);
        };
        n.style.pointerEvents = "none", n.style.position = "absolute", n.style.overflow = "hidden", n.setAttribute("aria-hidden", "true");
        const C = P(n);
        C && (C.style.opacity = "0");
        const _ = q(n);
        _ && (_.classList.add(u ? s[o.caption_before_exit] : s[o.caption_after_exit]), _.addEventListener("animationend", W));
        const T = w(n);
        T && T.classList.add(u ? s[o.weeks_before_exit] : s[o.weeks_after_exit]), t.insertBefore(n, t.firstChild);
      });
    }
  });
}
export {
  D as useAnimation
};
//# sourceMappingURL=index270.js.map
