import { template as u, insert as c, createComponent as M, effect as l, setAttribute as g, style as $, setStyleProperty as p, className as E, use as j, delegateEvents as k } from "solid-js/web";
import { mergeProps as N, createSignal as b, onMount as U, onCleanup as D, Show as F } from "solid-js";
import { cn as L } from "./index103.js";
var S = /* @__PURE__ */ u('<video autoplay playsinline muted class="zen-rounded-zen-md zen-border zen-border-zen-border">'), A = /* @__PURE__ */ u('<div><button type=button class="zen-inline-flex zen-h-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-bg-zen-primary zen-px-4 zen-text-sm zen-font-medium zen-text-zen-primary-fg zen-transition-colors hover:zen-opacity-90 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 disabled:zen-pointer-events-none disabled:zen-opacity-50">'), P = /* @__PURE__ */ u('<div class="zen-flex zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-zen-border zen-p-4 zen-text-center zen-text-sm zen-text-zen-error"role=alert>');
const O = (y) => {
  const r = N({
    width: 480,
    height: 360,
    facingMode: "user",
    screenshotFormat: "image/jpeg",
    mirrored: !0,
    captureLabel: "Capture"
  }, y), [m, h] = b(null), [v, w] = b(!1);
  let a, d = null;
  const z = () => {
    d?.getTracks().forEach((i) => i.stop()), d = null;
  };
  U(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      h("Camera is unavailable — this browser has no getUserMedia, or the page is not on https/localhost.");
      return;
    }
    try {
      d = await navigator.mediaDevices.getUserMedia({
        audio: !1,
        video: {
          facingMode: r.facingMode,
          width: r.width,
          height: r.height
        }
      });
    } catch (i) {
      const o = i?.name;
      h(o === "NotAllowedError" ? "Camera permission denied." : o === "NotFoundError" ? "No camera found." : `Camera failed to start${o ? ` (${o})` : ""}.`);
      return;
    }
    if (!a) {
      z();
      return;
    }
    a.srcObject = d;
    try {
      await a.play();
    } catch {
    }
    w(!0);
  }), D(z);
  const x = () => {
    if (!a || !v()) return;
    const i = a.videoWidth || r.width, o = a.videoHeight || r.height, e = document.createElement("canvas");
    e.width = i, e.height = o;
    const t = e.getContext("2d");
    t && (r.mirrored && (t.translate(i, 0), t.scale(-1, 1)), t.drawImage(a, 0, 0, i, o), r.onCapture?.(e.toDataURL(r.screenshotFormat)));
  };
  return (() => {
    var i = A(), o = i.firstChild;
    return c(i, M(F, {
      get when() {
        return !m();
      },
      get fallback() {
        return (() => {
          var e = P();
          return c(e, m), l((t) => {
            var n = `${r.width}px`, s = `${r.height}px`;
            return n !== t.e && p(e, "width", t.e = n), s !== t.t && p(e, "height", t.t = s), t;
          }, {
            e: void 0,
            t: void 0
          }), e;
        })();
      },
      get children() {
        var e = S(), t = a;
        return typeof t == "function" ? j(t, e) : a = e, l((n) => {
          var s = r.width, f = r.height, C = r.mirrored ? {
            transform: "scaleX(-1)"
          } : void 0;
          return s !== n.e && g(e, "width", n.e = s), f !== n.t && g(e, "height", n.t = f), n.a = $(e, C, n.a), n;
        }, {
          e: void 0,
          t: void 0,
          a: void 0
        }), e;
      }
    }), o), o.$$click = x, c(o, () => r.captureLabel), l((e) => {
      var t = L("zen-flex zen-flex-col zen-items-center zen-gap-3", r.class), n = !v();
      return t !== e.e && E(i, e.e = t), n !== e.t && (o.disabled = e.t = n), e;
    }, {
      e: void 0,
      t: void 0
    }), i;
  })();
};
k(["click"]);
export {
  O as Camera
};
//# sourceMappingURL=index101.js.map
