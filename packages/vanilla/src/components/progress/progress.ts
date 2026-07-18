import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";

export type ProgressSize = "sm" | "md" | "lg";
export type ProgressColor = "primary" | "neutral" | "info" | "success" | "warning" | "error";

export interface ProgressProps extends BaseProps {
  /** 0-100. Omit / null for an indeterminate bar. */
  value?: number | null;
  max?: number;
  size?: ProgressSize;
  color?: ProgressColor;
}

const TRACK: Record<ProgressSize, string> = { sm: "zen-h-1", md: "zen-h-2", lg: "zen-h-3" };
const FILL: Record<ProgressColor, string> = {
  primary: "zen-bg-zen-primary", neutral: "zen-bg-zen-neutral", info: "zen-bg-zen-info",
  success: "zen-bg-zen-success", warning: "zen-bg-zen-warning", error: "zen-bg-zen-error",
};

export function Progress(props: ProgressProps = {}): ZenComponent<ProgressProps> {
  let current = { ...props };
  const el = document.createElement("div");
  const indicator = document.createElement("div");
  el.append(indicator);
  const disposer = new Disposer();
  let remove: (() => void) | undefined;
  const render = () => {
    const { class: className, value, max = 100, size = "md", color = "primary", children: _c, ...rest } = current;
    el.className = cn("zen-relative zen-w-full zen-overflow-hidden zen-rounded-zen-full zen-bg-zen-muted", TRACK[size], className);
    el.setAttribute("role", "progressbar");
    el.setAttribute("aria-valuemin", "0");
    el.setAttribute("aria-valuemax", String(max));
    indicator.className = cn("zen-h-full zen-w-full zen-flex-1 zen-transition-transform", FILL[color]);
    if (value === null || value === undefined) {
      el.removeAttribute("aria-valuenow");
      indicator.style.transform = "translateX(-100%)";
    } else {
      const pct = Math.max(0, Math.min(100, (value / max) * 100));
      el.setAttribute("aria-valuenow", String(value));
      indicator.style.transform = `translateX(-${100 - pct}%)`;
    }
    remove?.();
    remove = applyProps(el, rest as Record<string, unknown>);
  };
  render();
  disposer.add(() => remove?.());
  return { el, update(n) { current = { ...current, ...n }; render(); }, destroy() { disposer.dispose(); el.remove(); } };
}
