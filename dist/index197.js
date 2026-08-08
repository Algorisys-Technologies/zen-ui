import * as a from "react";
var n = 0, t = null;
function d() {
  a.useEffect(() => {
    t || (t = { start: r(), end: r() });
    const { start: e, end: o } = t;
    return document.body.firstElementChild !== e && document.body.insertAdjacentElement("afterbegin", e), document.body.lastElementChild !== o && document.body.insertAdjacentElement("beforeend", o), n++, () => {
      n === 1 && (t?.start.remove(), t?.end.remove(), t = null), n = Math.max(0, n - 1);
    };
  }, []);
}
function r() {
  const e = document.createElement("span");
  return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
export {
  d as useFocusGuards
};
//# sourceMappingURL=index197.js.map
