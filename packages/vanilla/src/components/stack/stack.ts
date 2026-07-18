import { cn } from "../../lib/cn";
import { applyProps, Disposer, setChildren, type BaseProps, type ZenComponent } from "../../lib/component";

const ALIGN = { start: "zen-items-start", center: "zen-items-center", end: "zen-items-end", stretch: "zen-items-stretch" } as const;
const JUSTIFY = { start: "zen-justify-start", center: "zen-justify-center", end: "zen-justify-end", between: "zen-justify-between" } as const;

export interface StackProps extends BaseProps {
  direction?: "row" | "column";
  align?: keyof typeof ALIGN;
  justify?: keyof typeof JUSTIFY;
  wrap?: boolean;
  /** number = px, or any CSS length */
  gap?: number | string;
  padding?: number | string;
}

const len = (v: number | string | undefined) => (v === undefined ? undefined : typeof v === "number" ? `${v}px` : v);

export function Stack(props: StackProps = {}): ZenComponent<StackProps> {
  let current = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let remove: (() => void) | undefined;
  const render = () => {
    const { class: className, direction = "column", align, justify, wrap, gap, padding, children, ...rest } = current;
    el.className = cn(
      "zen-flex",
      direction === "column" ? "zen-flex-col" : "zen-flex-row",
      wrap && "zen-flex-wrap",
      align && ALIGN[align],
      justify && JUSTIFY[justify],
      className,
    );
    const g = len(gap); const p = len(padding);
    if (g) el.style.gap = g; else el.style.removeProperty("gap");
    if (p) el.style.padding = p; else el.style.removeProperty("padding");
    setChildren(el, children);
    remove?.();
    remove = applyProps(el, rest as Record<string, unknown>);
  };
  render();
  disposer.add(() => remove?.());
  return { el, update(n) { current = { ...current, ...n }; render(); }, destroy() { disposer.dispose(); el.remove(); } };
}
