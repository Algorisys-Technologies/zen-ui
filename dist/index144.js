import { createComponent as w, isServer as F } from "solid-js/web";
import { createContext as N, useContext as b, createSignal as x, createMemo as f, onMount as I, onCleanup as R } from "solid-js";
import { NumberFormatter as y } from "./index184.js";
import { access as T } from "./index178.js";
var k = /* @__PURE__ */ new Set(["Avst", "Arab", "Armi", "Syrc", "Samr", "Mand", "Thaa", "Mend", "Nkoo", "Adlm", "Rohg", "Hebr"]), A = /* @__PURE__ */ new Set(["ae", "ar", "arc", "bcc", "bqi", "ckb", "dv", "fa", "glk", "he", "ku", "mzn", "nqo", "pnb", "ps", "sd", "ug", "ur", "yi"]);
function D(e) {
  if (Intl.Locale) {
    const n = new Intl.Locale(e).maximize().script ?? "";
    return k.has(n);
  }
  const t = e.split("-")[0];
  return A.has(t);
}
function L(e) {
  return D(e) ? "rtl" : "ltr";
}
function S() {
  let e = typeof navigator < "u" && // @ts-ignore
  (navigator.language || navigator.userLanguage) || "en-US";
  try {
    Intl.DateTimeFormat.supportedLocalesOf([e]);
  } catch {
    e = "en-US";
  }
  return {
    locale: e,
    direction: L(e)
  };
}
var m = S(), s = /* @__PURE__ */ new Set();
function h() {
  m = S();
  for (const e of s)
    e(m);
}
function v() {
  const e = {
    locale: "en-US",
    direction: "ltr"
  }, [t, n] = x(m), r = f(() => F ? e : t());
  return I(() => {
    s.size === 0 && window.addEventListener("languagechange", h), s.add(n), R(() => {
      s.delete(n), s.size === 0 && window.removeEventListener("languagechange", h);
    });
  }), {
    locale: () => r().locale,
    direction: () => r().direction
  };
}
var z = N();
function $(e) {
  const t = v(), n = {
    locale: () => e.locale ?? t.locale(),
    direction: () => e.locale ? L(e.locale) : t.direction()
  };
  return w(z.Provider, {
    value: n,
    get children() {
      return e.children;
    }
  });
}
function C() {
  const e = v();
  return b(z) || e;
}
var d = /* @__PURE__ */ new Map();
function M(e) {
  const {
    locale: t
  } = C(), n = f(() => t() + (e ? Object.entries(e).sort((r, a) => r[0] < a[0] ? -1 : 1).join() : ""));
  return f(() => {
    const r = n();
    let a;
    return d.has(r) && (a = d.get(r)), a || (a = new Intl.Collator(t(), e), d.set(r, a)), a;
  });
}
function j(e) {
  const t = M({
    usage: "search",
    ...e
  });
  return {
    startsWith: (i, o) => {
      if (o.length === 0)
        return !0;
      const l = i.normalize("NFC"), c = o.normalize("NFC");
      return t().compare(l.slice(0, c.length), c) === 0;
    },
    endsWith: (i, o) => {
      if (o.length === 0)
        return !0;
      const l = i.normalize("NFC"), c = o.normalize("NFC");
      return t().compare(l.slice(-c.length), c) === 0;
    },
    contains: (i, o) => {
      if (o.length === 0)
        return !0;
      const l = i.normalize("NFC"), c = o.normalize("NFC");
      let u = 0;
      const g = o.length;
      for (; u + g <= l.length; u++) {
        const p = l.slice(u, u + g);
        if (t().compare(c, p) === 0)
          return !0;
      }
      return !1;
    }
  };
}
function q(e) {
  const {
    locale: t
  } = C();
  return f(() => new y(t(), T(e)));
}
export {
  $ as I18nProvider,
  A as RTL_LANGS,
  M as createCollator,
  v as createDefaultLocale,
  j as createFilter,
  q as createNumberFormatter,
  S as getDefaultLocale,
  L as getReadingDirection,
  D as isRTL,
  C as useLocale
};
//# sourceMappingURL=index144.js.map
