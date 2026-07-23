import { createComponent as m } from "solid-js/web";
import { createSignal as l, onMount as u, onCleanup as a } from "solid-js";
import { I18nProvider as d, getReadingDirection as f } from "./index144.js";
import "./index103.js";
import { readDocumentDirection as o, observeDocumentDirection as D } from "./index112.js";
import "./index25.js";
const g = {
  ltr: "en",
  rtl: "ar"
}, R = (e) => {
  const [c, n] = l(o());
  u(() => {
    n(o()), a(D(n));
  });
  const r = () => e.dir ?? c(), i = () => {
    if (e.locale) return e.locale;
    const t = typeof document > "u" ? "" : document.documentElement.lang;
    if (t)
      try {
        if (f(t) === r()) return t;
      } catch {
      }
    return g[r()];
  };
  return m(d, {
    get locale() {
      return i();
    },
    get children() {
      return e.children;
    }
  });
};
export {
  R as DirectionProvider
};
//# sourceMappingURL=index92.js.map
