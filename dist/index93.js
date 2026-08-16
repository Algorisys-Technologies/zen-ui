import * as n from "react";
import { getInitialTheme as i, THEME_EVENT_NAME as o, applyTheme as E, THEMES as c, isThemeName as u } from "./index142.js";
function d() {
  const [e, s] = n.useState(() => i());
  n.useEffect(() => {
    document.documentElement.setAttribute("data-theme", e);
  }, [e]), n.useEffect(() => {
    const t = (r) => {
      const m = r.detail;
      u(m) && m !== e && s(m);
    };
    return window.addEventListener(o, t), () => window.removeEventListener(o, t);
  }, [e]);
  const a = n.useCallback((t) => {
    s(t), E(t);
  }, []);
  return { theme: e, setTheme: a, themes: c };
}
export {
  c as THEMES,
  E as applyTheme,
  i as getInitialTheme,
  d as useTheme
};
//# sourceMappingURL=index93.js.map
