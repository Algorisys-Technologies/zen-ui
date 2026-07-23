import { createComponent as t, mergeProps as v, template as z, insert as s, effect as w, setStyleProperty as x } from "solid-js/web";
import { splitProps as V, createMemo as u, For as m, Show as d } from "solid-js";
import { Slider as l } from "./index129.js";
import { cn as o } from "./index106.js";
var $ = /* @__PURE__ */ z('<span aria-hidden=true class="zen-pointer-events-none zen-absolute zen-inset-x-0 zen-top-full zen-mt-1">'), k = /* @__PURE__ */ z('<span class="zen-whitespace-nowrap zen-text-xs zen-text-zen-muted-fg">'), S = /* @__PURE__ */ z('<span class="zen-absolute zen-flex zen-flex-col zen-items-center zen-gap-1"style=transform:translateX(-50%)><span class="zen-h-1.5 zen-w-px zen-bg-zen-border">');
const T = (g) => {
  const [e, p] = V(g, ["value", "defaultValue", "onChange", "minValue", "maxValue", "step", "minStepsBetweenThumbs", "orientation", "disabled", "name", "marks", "class"]), h = u(() => (e.value ?? e.defaultValue ?? [0]).map((r, n) => n)), c = u(() => !!e.marks?.length && e.orientation !== "vertical"), f = u(() => !!e.marks?.some((a) => a.label !== void 0)), b = (a) => {
    const r = e.minValue ?? 0, n = e.maxValue ?? 100;
    return n === r ? 0 : Math.max(0, Math.min(100, (a - r) / (n - r) * 100));
  };
  return t(l, v(p, {
    get value() {
      return e.value;
    },
    get defaultValue() {
      return e.defaultValue;
    },
    get onChange() {
      return e.onChange;
    },
    get minValue() {
      return e.minValue;
    },
    get maxValue() {
      return e.maxValue;
    },
    get step() {
      return e.step;
    },
    get minStepsBetweenThumbs() {
      return e.minStepsBetweenThumbs;
    },
    get orientation() {
      return e.orientation;
    },
    get disabled() {
      return e.disabled;
    },
    get name() {
      return e.name;
    },
    get class() {
      return o(
        "zen-relative zen-flex zen-w-full zen-touch-none zen-select-none zen-items-center",
        "data-[orientation=vertical]:zen-h-full data-[orientation=vertical]:zen-w-2 data-[orientation=vertical]:zen-flex-col",
        // The marks layer is absolutely positioned, so it reserves no height of
        // its own. Without this the labels sit on top of whatever follows.
        c() && (f() ? "zen-mb-7" : "zen-mb-3"),
        e.class
      );
    },
    get children() {
      return [t(l.Track, {
        get class() {
          return o("zen-relative zen-h-2 zen-w-full zen-grow zen-overflow-hidden zen-rounded-zen-full zen-bg-zen-muted", "data-[orientation=vertical]:zen-h-full data-[orientation=vertical]:zen-w-2");
        },
        get children() {
          return t(l.Fill, {
            get class() {
              return o("zen-absolute zen-h-full zen-bg-zen-primary", "data-[orientation=vertical]:zen-w-full");
            }
          });
        }
      }), t(m, {
        get each() {
          return h();
        },
        children: () => t(l.Thumb, {
          get class() {
            return o("zen-block zen-h-5 zen-w-5 zen-rounded-zen-full zen-border-2 zen-border-zen-primary zen-bg-zen-background", "zen-transition-colors", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2", "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50");
          },
          get children() {
            return t(l.Input, {});
          }
        })
      }), t(d, {
        get when() {
          return c();
        },
        get children() {
          var a = $();
          return s(a, t(m, {
            get each() {
              return e.marks;
            },
            children: (r) => (() => {
              var n = S();
              return n.firstChild, s(n, t(d, {
                get when() {
                  return r.label !== void 0;
                },
                get children() {
                  var i = k();
                  return s(i, () => r.label), i;
                }
              }), null), w((i) => x(n, "left", `${b(r.value)}%`)), n;
            })()
          })), a;
        }
      })];
    }
  }));
};
export {
  T as Slider
};
//# sourceMappingURL=index55.js.map
