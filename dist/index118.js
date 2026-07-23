import { createComponent as c, mergeProps as s, memo as b } from "solid-js/web";
import { Polymorphic as l } from "./index175.js";
import { __export as v } from "./index159.js";
import { splitProps as y, createSignal as m, createContext as k, createEffect as g, on as L, onCleanup as f, Show as I, useContext as p } from "solid-js";
var P = {};
v(P, {
  Fallback: () => w,
  Image: () => D,
  Img: () => x,
  Root: () => C,
  useImageContext: () => d
});
var h = k();
function d() {
  const e = p(h);
  if (e === void 0)
    throw new Error("[kobalte]: `useImageContext` must be used within an `Image.Root` component");
  return e;
}
function w(e) {
  const o = d(), [r, n] = m(o.fallbackDelay() === void 0);
  return g(() => {
    const t = o.fallbackDelay();
    if (t !== void 0) {
      const i = window.setTimeout(() => n(!0), t);
      f(() => window.clearTimeout(i));
    }
  }), c(I, {
    get when() {
      return b(() => !!r())() && o.imageLoadingStatus() !== "loaded";
    },
    get children() {
      return c(l, s({
        as: "span"
      }, e));
    }
  });
}
function x(e) {
  const o = d(), [r, n] = m("idle");
  return g(L(() => e.src, (t) => {
    if (!t) {
      n("error");
      return;
    }
    let i = !0;
    const a = new window.Image(), u = (S) => () => {
      i && n(S);
    };
    n("loading"), e.crossOrigin !== void 0 && (a.crossOrigin = e.crossOrigin), e.referrerPolicy !== void 0 && (a.referrerPolicy = e.referrerPolicy), a.onload = u("loaded"), a.onerror = u("error"), a.src = t, f(() => {
      i = !1;
    });
  })), g(() => {
    const t = r();
    t !== "idle" && o.onImageLoadingStatusChange(t);
  }), c(I, {
    get when() {
      return r() === "loaded";
    },
    get children() {
      return c(l, s({
        as: "img"
      }, e));
    }
  });
}
function C(e) {
  const [o, r] = y(e, ["fallbackDelay", "onLoadingStatusChange"]), [n, t] = m("idle"), i = {
    fallbackDelay: () => o.fallbackDelay,
    imageLoadingStatus: n,
    onImageLoadingStatusChange: (a) => {
      t(a), o.onLoadingStatusChange?.(a);
    }
  };
  return c(h.Provider, {
    value: i,
    get children() {
      return c(l, s({
        as: "span"
      }, r));
    }
  });
}
var D = Object.assign(C, {
  Fallback: w,
  Img: x
});
export {
  D as Image,
  w as ImageFallback,
  x as ImageImg,
  C as ImageRoot,
  P as image_exports,
  d as useImageContext
};
//# sourceMappingURL=index118.js.map
