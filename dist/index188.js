import { jsxs as p, jsx as e } from "react/jsx-runtime";
import * as n from "react";
import { useLocale as b } from "./index90.js";
import { cn as x } from "./index197.js";
const g = n.lazy(() => import("react-webcam")), y = ({
  onCapture: s,
  width: r = 480,
  height: t = 360,
  facingMode: i = "user",
  screenshotFormat: l = "image/jpeg",
  mirrored: z = !0,
  captureLabel: m,
  className: u
}) => {
  const o = b(), f = m ?? o.t("camera.capture"), c = n.useRef(null), d = n.useCallback(() => {
    const a = c.current?.getScreenshot?.();
    a && s?.(a);
  }, [s]);
  return /* @__PURE__ */ p("div", { className: x("zen-flex zen-flex-col zen-items-center zen-gap-3", u), children: [
    /* @__PURE__ */ e(
      n.Suspense,
      {
        fallback: /* @__PURE__ */ e(
          "div",
          {
            className: "zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg",
            style: { width: r, height: t },
            children: o.t("camera.loading")
          }
        ),
        children: /* @__PURE__ */ e(
          g,
          {
            ref: c,
            audio: !1,
            width: r,
            height: t,
            mirrored: z,
            screenshotFormat: l,
            videoConstraints: { facingMode: i, width: r, height: t },
            className: "zen-rounded-zen-md zen-border zen-border-zen-border"
          }
        )
      }
    ),
    /* @__PURE__ */ e(
      "button",
      {
        type: "button",
        onClick: d,
        className: "zen-inline-flex zen-h-9 zen-items-center zen-justify-center zen-rounded-zen-md zen-bg-zen-primary zen-px-4 zen-text-sm zen-font-medium zen-text-zen-primary-fg zen-transition-colors hover:zen-opacity-90 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        children: f
      }
    )
  ] });
};
y.displayName = "Camera";
export {
  y as Camera
};
//# sourceMappingURL=index188.js.map
