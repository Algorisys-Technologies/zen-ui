import * as i from "react";
import { useLayoutEffect as y } from "./index208.js";
function E(n, e) {
  return i.useReducer((t, r) => e[t][r] ?? t, n);
}
var T = (n) => {
  const { present: e, children: t } = n, r = v(e), s = typeof t == "function" ? t({ present: r.isPresent }) : i.Children.only(t), u = S(r.ref, h(s));
  return typeof t == "function" || r.isPresent ? i.cloneElement(s, { ref: u }) : null;
};
T.displayName = "Presence";
function v(n) {
  const [e, t] = i.useState(), r = i.useRef(null), s = i.useRef(n), u = i.useRef("none"), o = i.useRef(void 0), m = n ? "mounted" : "unmounted", [A, c] = E(m, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended"
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted"
    },
    unmounted: {
      MOUNT: "mounted"
    }
  });
  return i.useEffect(() => {
    A === "mounted" ? (u.current = o.current ?? N(r.current), o.current = void 0) : u.current = "none";
  }, [A]), y(() => {
    const a = r.current, f = s.current;
    if (f !== n) {
      const p = u.current, l = N(a);
      n ? (o.current = l, c("MOUNT")) : l === "none" || a?.display === "none" ? c("UNMOUNT") : c(f && p !== l ? "ANIMATION_OUT" : "UNMOUNT"), s.current = n;
    }
  }, [n, c]), y(() => {
    if (e) {
      let a;
      const f = e.ownerDocument.defaultView ?? window, d = (l) => {
        const M = N(r.current).includes(CSS.escape(l.animationName));
        if (l.target === e && M && (c("ANIMATION_END"), !s.current)) {
          const O = e.style.animationFillMode;
          e.style.animationFillMode = "forwards", a = f.setTimeout(() => {
            e.style.animationFillMode === "forwards" && (e.style.animationFillMode = O);
          });
        }
      }, p = (l) => {
        l.target === e && (u.current = N(r.current));
      };
      return e.addEventListener("animationstart", p), e.addEventListener("animationcancel", d), e.addEventListener("animationend", d), () => {
        f.clearTimeout(a), e.removeEventListener("animationstart", p), e.removeEventListener("animationcancel", d), e.removeEventListener("animationend", d);
      };
    } else
      c("ANIMATION_END");
  }, [e, c]), {
    isPresent: ["mounted", "unmountSuspended"].includes(A),
    ref: i.useCallback((a) => {
      if (a) {
        const f = getComputedStyle(a);
        r.current = f, o.current = N(f);
      } else
        r.current = null;
      t(a);
    }, [])
  };
}
function R(n, e) {
  if (typeof n == "function")
    return n(e);
  n != null && (n.current = e);
}
function S(...n) {
  const e = i.useRef(n);
  return e.current = n, i.useCallback((t) => {
    const r = e.current;
    let s = !1;
    const u = r.map((o) => {
      const m = R(o, t);
      return !s && typeof m == "function" && (s = !0), m;
    });
    if (s)
      return () => {
        for (let o = 0; o < u.length; o++) {
          const m = u[o];
          typeof m == "function" ? m() : R(r[o], null);
        }
      };
  }, []);
}
function N(n) {
  return n?.animationName || "none";
}
function h(n) {
  let e = Object.getOwnPropertyDescriptor(n.props, "ref")?.get, t = e && "isReactWarning" in e && e.isReactWarning;
  return t ? n.ref : (e = Object.getOwnPropertyDescriptor(n, "ref")?.get, t = e && "isReactWarning" in e && e.isReactWarning, t ? n.props.ref : n.props.ref || n.ref);
}
export {
  T as Presence
};
//# sourceMappingURL=index200.js.map
