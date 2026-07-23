import { createSignal as a, onMount as r, onCleanup as s } from "solid-js";
import { getInitialTheme as d, THEME_EVENT_NAME as o, THEMES as h, isThemeName as u, applyTheme as E } from "./index105.js";
function p() {
  const [n, m] = a(d());
  return r(() => {
    document.documentElement.setAttribute("data-theme", n());
    const e = (i) => {
      const t = i.detail;
      u(t) && t !== n() && (m(t), document.documentElement.setAttribute("data-theme", t));
    };
    window.addEventListener(o, e), s(() => window.removeEventListener(o, e));
  }), { theme: n, setTheme: (e) => {
    m(e), E(e);
  }, themes: h };
}
export {
  h as THEMES,
  E as applyTheme,
  d as getInitialTheme,
  p as useTheme
};
//# sourceMappingURL=index4.js.map
