import { jsxs as u, jsx as e } from "react/jsx-runtime";
import * as n from "react";
import { cn as d } from "./index143.js";
const p = n.lazy(() => import("react-webcam")), b = ({
  onCapture: t,
  width: r = 480,
  height: s = 360,
  facingMode: z = "user",
  screenshotFormat: a = "image/jpeg",
  mirrored: c = !0,
  captureLabel: l = "Capture",
  className: m
}) => {
  const i = n.useRef(null), f = n.useCallback(() => {
    const o = i.current?.getScreenshot?.();
    o && t?.(o);
  }, [t]);
  return /* @__PURE__ */ u("div", { className: d("zen-flex zen-flex-col zen-items-center zen-gap-3", m), children: [
    /* @__PURE__ */ e(
      n.Suspense,
      {
        fallback: /* @__PURE__ */ e(
          "div",
          {
            className: "zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg",
            style: { width: r, height: s },
            children: "Loading camera…"
          }
        ),
        children: /* @__PURE__ */ e(
          p,
          {
            ref: i,
            audio: !1,
            width: r,
            height: s,
            mirrored: c,
            screenshotFormat: a,
            videoConstraints: { facingMode: z, width: r, height: s },
            className: "zen-rounded-zen-md zen-border zen-border-zen-border"
          }
        )
      }
    ),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        onClick: f,
        className: "zen-inline-flex zen-h-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-bg-zen-primary zen-px-4 zen-text-sm zen-font-medium zen-text-zen-primary-fg zen-transition-colors hover:zen-opacity-90 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        children: l
      }
    )
  ] });
};
b.displayName = "Camera";
export {
  b as Camera
};
//# sourceMappingURL=index134.js.map
