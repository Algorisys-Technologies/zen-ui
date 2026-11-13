import * as r from "react";
const b = { position: "fixed", visibility: "hidden" };
function $(a) {
  const [x, f] = r.useState(b), [g, v] = r.useState("ltr"), h = r.useRef(a);
  h.current = a;
  const i = r.useCallback(() => {
    const t = h.current, n = t.gap ?? 4, o = 8, c = t.anchor.current;
    if (!c) return;
    const e = c.getBoundingClientRect(), m = t.popup.current, s = window.innerHeight - e.bottom - n - o, l = e.top - n - o, H = Math.min(t.maxHeight, m?.scrollHeight ?? t.maxHeight), u = s < H && l > s, w = getComputedStyle(c).direction === "rtl", p = t.matchWidth ? e.width : Math.max(e.width, m?.offsetWidth ?? e.width);
    let d = w ? e.right - p : e.left;
    d = Math.max(o, Math.min(d, window.innerWidth - o - p)), v(w ? "rtl" : "ltr"), f({
      position: "fixed",
      left: `${d}px`,
      ...t.matchWidth ? { width: `${e.width}px` } : { minWidth: `${e.width}px`, maxWidth: `calc(100vw - ${o * 2}px)` },
      ...u ? { bottom: `${window.innerHeight - e.top + n}px` } : { top: `${e.bottom + n}px` },
      maxHeight: `${Math.max(96, Math.min(t.maxHeight, u ? l : s))}px`
    });
  }, []);
  return r.useLayoutEffect(() => {
    if (!a.open) return;
    i();
    let t = requestAnimationFrame(i);
    const n = () => {
      cancelAnimationFrame(t), t = requestAnimationFrame(i);
    };
    return window.addEventListener("scroll", n, !0), window.addEventListener("resize", n), () => {
      cancelAnimationFrame(t), window.removeEventListener("scroll", n, !0), window.removeEventListener("resize", n);
    };
  }, [a.open, i]), { style: x, dir: g, measure: i };
}
export {
  $ as useAnchoredPlacement
};
//# sourceMappingURL=index257.js.map
