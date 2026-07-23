import { template as l, insert as g, createComponent as o, memo as L, effect as M, className as E, setStyleProperty as D, setAttribute as P, use as R } from "solid-js/web";
import { createSignal as V, createEffect as j, onCleanup as C, Show as s } from "solid-js";
import { cn as S } from "./index106.js";
var B = /* @__PURE__ */ l('<div class="zen-absolute zen-inset-0 zen-flex zen-items-center zen-justify-center zen-p-4 zen-text-center zen-text-sm zen-text-zen-muted-fg">'), F = /* @__PURE__ */ l('<div class="zen-absolute zen-inset-x-0 zen-bottom-2 zen-text-center zen-text-xs zen-text-white/80">Starting camera…'), N = /* @__PURE__ */ l("<div><video playsinline muted>"), T = /* @__PURE__ */ l('<svg viewBox="0 0 100 100"preserveAspectRatio=none class="zen-pointer-events-none zen-absolute zen-inset-0 zen-h-full zen-w-full"aria-hidden=true><g stroke=white stroke-width=2 stroke-linecap=round fill=none style="filter:drop-shadow(0 1px 3px rgba(0,0,0,.45))"><path d="M 20 26 L 20 20 L 26 20"></path><path d="M 74 20 L 80 20 L 80 26"></path><path d="M 80 74 L 80 80 L 74 80"></path><path d="M 26 80 L 20 80 L 20 74">'), q = /* @__PURE__ */ l("<span>Camera access was blocked. Allow camera permission in your browser settings, then reload."), Q = /* @__PURE__ */ l("<span>No camera was found on this device."), I = /* @__PURE__ */ l("<span>This browser does not support the BarcodeDetector API. Pass a <code>decode</code> prop (e.g. powered by jsQR) to enable scanning."), O = /* @__PURE__ */ l("<span>Scanner idle.");
const W = (t) => {
  let a, i = null, d = null, w = null, u = !1, v = {
    value: "",
    at: 0
  };
  const [h, f] = V("idle"), b = () => {
    u = !0, d !== null && cancelAnimationFrame(d), d = null, i && (i.getTracks().forEach((r) => r.stop()), i = null), a && (a.srcObject = null);
  }, p = () => t.cooldownMs ?? 1500, _ = () => t.formats ?? ["qr_code"], $ = async () => {
    u = !1, f("starting");
    let r = !1;
    if (typeof window < "u" && window.BarcodeDetector)
      try {
        w = new window.BarcodeDetector({
          formats: _()
        }), r = !0;
      } catch (e) {
        w = null, t.onError?.(e);
      }
    if (!r && !t.decode) {
      f("no-decoder");
      return;
    }
    try {
      i = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: t.facingMode ?? "environment"
        },
        audio: !1
      });
    } catch (e) {
      const n = e;
      n.name === "NotAllowedError" || n.name === "SecurityError" || n.name === "PermissionDeniedError" ? f("blocked") : f("no-camera"), t.onError?.(n);
      return;
    }
    if (u) {
      i.getTracks().forEach((e) => e.stop());
      return;
    }
    if (!a) {
      i.getTracks().forEach((e) => e.stop());
      return;
    }
    a.srcObject = i;
    try {
      await a.play();
    } catch (e) {
      t.onError?.(e);
    }
    f("scanning");
    const c = (e) => {
      const n = Date.now();
      e.rawValue === v.value && n - v.at < p() || (v = {
        value: e.rawValue,
        at: n
      }, t.onScan(e));
    }, m = async () => {
      if (u || !a) return;
      const e = a;
      if (e.readyState >= 2 && !e.paused)
        try {
          if (r && w) {
            const n = await w.detect(e);
            n.length && c({
              rawValue: n[0].rawValue,
              format: n[0].format,
              cornerPoints: n[0].cornerPoints
            });
          } else if (t.decode) {
            const n = await t.decode(e);
            n && c(n);
          }
        } catch (n) {
          t.onError?.(n);
        }
      u || (d = requestAnimationFrame(m));
    };
    d = requestAnimationFrame(m);
  };
  j(() => {
    if (t.paused) {
      b();
      return;
    }
    $();
  }), C(b);
  const z = () => h() === "scanning" || h() === "starting", A = () => t.aspectRatio ?? 1;
  return (() => {
    var r = N(), c = r.firstChild, m = a;
    return typeof m == "function" ? R(m, c) : a = c, g(r, o(s, {
      get when() {
        return L(() => !t.hideViewfinder)() && z();
      },
      get children() {
        return o(U, {});
      }
    }), null), g(r, o(s, {
      get when() {
        return !z();
      },
      get children() {
        var e = B();
        return g(e, () => t.fallback ?? o(G, {
          get status() {
            return h();
          }
        })), e;
      }
    }), null), g(r, o(s, {
      get when() {
        return h() === "starting";
      },
      get children() {
        return F();
      }
    }), null), M((e) => {
      var n = S("zen-relative zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted", t.class), y = `${A()} / 1`, k = t["aria-label"] ?? "QR scanner camera view", x = S("zen-absolute zen-inset-0 zen-h-full zen-w-full zen-object-cover", !z() && "zen-invisible");
      return n !== e.e && E(r, e.e = n), y !== e.t && D(r, "aspect-ratio", e.t = y), k !== e.a && P(c, "aria-label", e.a = k), x !== e.o && E(c, e.o = x), e;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    }), r;
  })();
}, U = () => (() => {
  var t = T();
  return t.firstChild, t;
})(), G = (t) => o(s, {
  get when() {
    return t.status === "blocked";
  },
  get fallback() {
    return o(s, {
      get when() {
        return t.status === "no-camera";
      },
      get fallback() {
        return o(s, {
          get when() {
            return t.status === "no-decoder";
          },
          get fallback() {
            return O();
          },
          get children() {
            return I();
          }
        });
      },
      get children() {
        return Q();
      }
    });
  },
  get children() {
    return q();
  }
});
export {
  W as QRScanner
};
//# sourceMappingURL=index90.js.map
