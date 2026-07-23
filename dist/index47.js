import { createComponent as r, mergeProps as a } from "solid-js/web";
import { splitProps as o } from "solid-js";
import { Progress as n } from "./index122.js";
import { cn as t } from "./index106.js";
const i = {
  sm: "zen-h-1",
  md: "zen-h-2",
  lg: "zen-h-3"
}, u = {
  primary: "zen-bg-zen-primary",
  neutral: "zen-bg-zen-neutral",
  info: "zen-bg-zen-info",
  success: "zen-bg-zen-success",
  warning: "zen-bg-zen-warning",
  error: "zen-bg-zen-error"
}, d = (l) => {
  const [e, s] = o(l, ["class", "size", "color", "value", "minValue", "maxValue", "indeterminate"]);
  return r(n, a(s, {
    get value() {
      return e.value;
    },
    get minValue() {
      return e.minValue;
    },
    get maxValue() {
      return e.maxValue;
    },
    get indeterminate() {
      return e.indeterminate;
    },
    get class() {
      return t("zen-relative zen-w-full zen-overflow-hidden zen-rounded-zen-full zen-bg-zen-muted", i[e.size ?? "md"], e.class);
    },
    get children() {
      return r(n.Track, {
        class: "zen-h-full zen-w-full",
        get children() {
          return r(n.Fill, {
            get class() {
              return t("zen-h-full zen-w-[var(--kb-progress-fill-width)] zen-transition-[width]", u[e.color ?? "primary"]);
            }
          });
        }
      });
    }
  }));
};
export {
  d as Progress
};
//# sourceMappingURL=index47.js.map
