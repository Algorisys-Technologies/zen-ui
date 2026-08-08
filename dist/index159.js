import * as s from "react";
import { createContextScope as I } from "./index195.js";
import { useCallbackRef as S } from "./index207.js";
import { useLayoutEffect as p } from "./index208.js";
import { Primitive as f } from "./index203.js";
import { jsx as l } from "react/jsx-runtime";
var v = "Avatar", [C] = I(v), R = [
  0,
  () => {
  }
], [w, A] = C(v), _ = s.forwardRef(
  (e, r) => {
    const { __scopeAvatar: t, ...o } = e, [u, a] = s.useState("idle"), [i, n] = x();
    return /* @__PURE__ */ l(
      w,
      {
        scope: t,
        imageLoadingStatus: u,
        setImageLoadingStatus: a,
        imageCount: i,
        setImageCount: n,
        children: /* @__PURE__ */ l(f.span, { ...o, ref: r })
      }
    );
  }
);
_.displayName = v;
var E = "AvatarImage", h = s.forwardRef(
  (e, r) => {
    const { __scopeAvatar: t, src: o, onLoadingStatusChange: u, ...a } = e, i = A(E, t);
    y(i.setImageCount);
    const n = b(o, {
      referrerPolicy: a.referrerPolicy,
      crossOrigin: a.crossOrigin,
      loadingStatus: i.imageLoadingStatus,
      setLoadingStatus: i.setImageLoadingStatus
    }), c = S((m) => {
      u?.(m);
    }), d = s.useRef(n);
    return p(() => {
      const m = d.current;
      d.current = n, n !== m && c(n);
    }, [n, c]), n === "loaded" ? /* @__PURE__ */ l(f.img, { ...a, ref: r, src: o }) : null;
  }
);
h.displayName = E;
var L = "AvatarFallback", T = s.forwardRef(
  (e, r) => {
    const { __scopeAvatar: t, delayMs: o, ...u } = e, a = A(L, t), [i, n] = s.useState(o === void 0);
    return s.useEffect(() => {
      if (o !== void 0) {
        const c = window.setTimeout(() => n(!0), o);
        return () => window.clearTimeout(c);
      }
    }, [o]), i && a.imageLoadingStatus !== "loaded" ? /* @__PURE__ */ l(f.span, { ...u, ref: r }) : null;
  }
);
T.displayName = L;
function b(e, {
  loadingStatus: r,
  setLoadingStatus: t,
  referrerPolicy: o,
  crossOrigin: u
}) {
  return p(() => {
    if (!e) {
      t("error");
      return;
    }
    const a = new window.Image(), i = (c) => {
      const d = c.currentTarget;
      t(g(d));
    }, n = () => t("error");
    return a.addEventListener("load", i), a.addEventListener("error", n), o && (a.referrerPolicy = o), a.crossOrigin = u ?? null, a.src = e, t(g(a)), () => {
      a.removeEventListener("load", i), a.removeEventListener("error", n), t("idle");
    };
  }, [e, u, o, t]), r;
}
function g(e) {
  return e.complete ? e.naturalWidth > 0 ? "loaded" : "error" : "loading";
}
function x() {
  let e = R;
  {
    e = s.useState(0);
    const [r] = e, t = s.useRef(!1);
    s.useEffect(() => {
      r > 1 && !t.current && (t.current = !0, console.warn(
        "Avatar: Only one `Avatar.Image` component should be rendered per `Avatar.Root`, but multiple were detected. This will lead to unexpected behavior."
      ));
    }, [r]);
  }
  return e;
}
function y(e) {
  s.useEffect(() => (e((r) => r + 1), () => {
    e((r) => r - 1);
  }), [e]);
}
export {
  _ as Avatar,
  T as AvatarFallback,
  h as AvatarImage,
  T as Fallback,
  h as Image,
  _ as Root
};
//# sourceMappingURL=index159.js.map
