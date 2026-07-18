import { cn } from "../../lib/cn";
import { applyProps, Disposer, setChildren, toNodes, type BaseProps, type Child, type ZenComponent } from "../../lib/component";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
const SIZES: Record<AvatarSize, string> = {
  xs: "zen-h-6 zen-w-6 zen-text-xs", sm: "zen-h-8 zen-w-8 zen-text-xs", md: "zen-h-10 zen-w-10 zen-text-sm",
  lg: "zen-h-12 zen-w-12 zen-text-base", xl: "zen-h-16 zen-w-16 zen-text-lg",
};

export interface AvatarProps extends BaseProps { size?: AvatarSize }

export function Avatar(props: AvatarProps = {}): ZenComponent<AvatarProps> {
  let current = { ...props };
  const el = document.createElement("span");
  const disposer = new Disposer();
  let remove: (() => void) | undefined;
  const render = () => {
    const { class: className, size = "md", children, ...rest } = current;
    el.className = cn("zen-relative zen-inline-flex zen-shrink-0 zen-overflow-hidden zen-rounded-zen-full", SIZES[size], className);
    setChildren(el, children);
    remove?.();
    remove = applyProps(el, rest as Record<string, unknown>);
  };
  render();
  disposer.add(() => remove?.());
  return { el, update(n) { current = { ...current, ...n }; render(); }, destroy() { disposer.dispose(); el.remove(); } };
}

export interface AvatarImageProps extends BaseProps { src?: string; alt?: string }

/** Hides itself if the image fails to load, so the fallback behind it shows. */
export function AvatarImage(props: AvatarImageProps = {}): ZenComponent<AvatarImageProps> {
  let current = { ...props };
  const el = document.createElement("img");
  el.addEventListener("error", () => (el.style.display = "none"));
  el.addEventListener("load", () => (el.style.display = ""));
  const render = () => {
    const { class: className, src, alt } = current;
    el.className = cn("zen-aspect-square zen-h-full zen-w-full zen-object-cover", className);
    el.style.display = "";
    if (src) el.src = src;
    el.alt = alt ?? "";
  };
  render();
  return { el, update(n) { current = { ...current, ...n }; render(); }, destroy() { el.remove(); } };
}

export const AvatarFallback = (props: BaseProps = {}): ZenComponent<BaseProps> => {
  const el = document.createElement("span");
  let current = { ...props };
  const render = () => {
    el.className = cn("zen-flex zen-h-full zen-w-full zen-items-center zen-justify-center zen-bg-zen-muted zen-text-zen-muted-fg zen-font-medium", current.class);
    setChildren(el, current.children);
  };
  render();
  return { el, update(n) { current = { ...current, ...n }; render(); }, destroy() { el.remove(); } };
};

export interface AvatarGroupProps extends BaseProps {
  max?: number;
  spacing?: "tight" | "default" | "loose";
  size?: AvatarSize;
}
const SPACING = { tight: "-zen-ml-3", default: "-zen-ml-2", loose: "-zen-ml-1" } as const;

export function AvatarGroup(props: AvatarGroupProps = {}): ZenComponent<AvatarGroupProps> {
  let current = { ...props };
  const el = document.createElement("div");
  const render = () => {
    const { class: className, max, spacing = "default", size = "md", children } = current;
    el.className = cn("zen-flex zen-items-center", className);
    const all = toNodes(children as Child);
    const visible = typeof max === "number" ? all.slice(0, max) : all;
    const overflow = typeof max === "number" && all.length > max ? all.length - max : 0;
    el.replaceChildren();
    visible.forEach((child, idx) => {
      const ring = document.createElement("div");
      ring.className = cn("zen-ring-2 zen-ring-zen-background zen-rounded-zen-full", idx > 0 && SPACING[spacing]);
      ring.append(child);
      el.append(ring);
    });
    if (overflow > 0) {
      const ring = document.createElement("div");
      ring.className = cn("zen-ring-2 zen-ring-zen-background zen-rounded-zen-full", SPACING[spacing]);
      const av = Avatar({ size, children: AvatarFallback({ children: `+${overflow}` }) });
      ring.append(av.el);
      el.append(ring);
    }
  };
  render();
  return { el, update(n) { current = { ...current, ...n }; render(); }, destroy() { el.remove(); } };
}
