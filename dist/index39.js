import { jsxs as z, jsx as a } from "react/jsx-runtime";
import * as h from "react";
import { Root as s, SliderTrack as v, Range as g, SliderThumb as x } from "./index158.js";
import { cn as l } from "./index145.js";
const p = h.forwardRef(({ className: c, marks: t, ...n }, d) => {
  const m = n.value ?? n.defaultValue ?? [0], i = n.min ?? 0, o = n.max ?? 100, r = !!t?.length && n.orientation !== "vertical", u = !!t?.some((e) => e.label !== void 0), f = (e) => o === i ? 0 : Math.max(0, Math.min(100, (e - i) / (o - i) * 100));
  return /* @__PURE__ */ z(
    s,
    {
      ref: d,
      className: l(
        "zen-relative zen-flex zen-w-full zen-touch-none zen-select-none zen-items-center",
        "data-[orientation=vertical]:zen-h-full data-[orientation=vertical]:zen-w-2 data-[orientation=vertical]:zen-flex-col",
        // The marks layer is absolutely positioned, so it reserves no height of
        // its own. Without this the labels sit on top of whatever follows.
        r && (u ? "zen-mb-7" : "zen-mb-3"),
        c
      ),
      ...n,
      children: [
        /* @__PURE__ */ a(
          v,
          {
            className: l(
              "zen-relative zen-h-2 zen-w-full zen-grow zen-overflow-hidden zen-rounded-zen-full zen-bg-zen-muted",
              "data-[orientation=vertical]:zen-h-full data-[orientation=vertical]:zen-w-2"
            ),
            children: /* @__PURE__ */ a(
              g,
              {
                className: l(
                  "zen-absolute zen-h-full zen-bg-zen-primary",
                  "data-[orientation=vertical]:zen-w-full"
                )
              }
            )
          }
        ),
        m.map((e, b) => /* @__PURE__ */ a(
          x,
          {
            className: l(
              "zen-block zen-h-5 zen-w-5 zen-rounded-zen-full zen-border-2 zen-border-zen-primary zen-bg-zen-background",
              "zen-transition-colors",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
              "disabled:zen-pointer-events-none disabled:zen-opacity-50"
            )
          },
          b
        )),
        r ? (
          // Outside the Track on purpose: the Track is overflow-hidden, so ticks
          // at the ends would be sliced in half by their own container.
          // pointer-events-none so a tick never eats a click meant for the track.
          /* @__PURE__ */ a(
            "span",
            {
              "aria-hidden": !0,
              className: "zen-pointer-events-none zen-absolute zen-inset-x-0 zen-top-full zen-mt-1",
              children: t.map((e) => /* @__PURE__ */ z(
                "span",
                {
                  className: "zen-absolute zen-flex zen-flex-col zen-items-center zen-gap-1",
                  style: { left: `${f(e.value)}%`, transform: "translateX(-50%)" },
                  children: [
                    /* @__PURE__ */ a("span", { className: "zen-h-1.5 zen-w-px zen-bg-zen-border" }),
                    e.label !== void 0 ? /* @__PURE__ */ a("span", { className: "zen-whitespace-nowrap zen-text-xs zen-text-zen-muted-fg", children: e.label }) : null
                  ]
                },
                e.value
              ))
            }
          )
        ) : null
      ]
    }
  );
});
p.displayName = s.displayName;
export {
  p as Slider
};
//# sourceMappingURL=index39.js.map
