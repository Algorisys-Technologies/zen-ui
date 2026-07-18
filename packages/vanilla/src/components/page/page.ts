import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";

/**
 * Page and Bar — the two small structural pieces of the Tier 1 frame
 * (docs/fiori-gap-analysis.md). Neither is clever; both are load-bearing,
 * because everything else in the frame assumes them.
 *
 *   Page — a whole-screen container: header / content / footer, where ONLY the
 *          content scrolls.
 *   Bar  — the three-slot (start / middle / end) row used for headers,
 *          subheaders and footers.
 *
 * React types both as `HTMLAttributes<HTMLDivElement>` with node-valued slot
 * props (header/footer, startContent/middleContent/endContent). Vanilla takes
 * those slots as `Child` and forwards the rest via `applyProps`.
 */

/* -------------------------------- Page --------------------------------- */

export interface PageProps extends BaseProps {
  header?: Child;
  footer?: Child;
  /** Removes the content padding — for a full-bleed table or map. */
  flush?: boolean;
}

const PAGE_OWN = new Set(["header", "footer", "flush", "class", "children", "style"]);

export function Page(props: PageProps = {}): ZenComponent<PageProps> {
  let current: PageProps = { ...props };
  // `h-full`, not `min-h-full`. min-height is a floor, not a ceiling: a page
  // that grows to fit its content means the content area never scrolls — it
  // just expands — and the overflow lands on whatever ancestor can take it,
  // producing a second scrollbar and a header that scrolls away. That exact
  // bug shipped in this repo's demo shell.
  const el = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const flush = current.flush ?? false;
    el.className = cn("zen-flex zen-h-full zen-flex-col zen-overflow-hidden", current.class);

    const parts: Node[] = [];

    if (current.header !== undefined && current.header !== null && current.header !== false) {
      const head = document.createElement("div");
      head.className = "zen-shrink-0";
      head.replaceChildren(...toNodes(current.header));
      parts.push(head);
    }

    // min-h-0 is what lets a flex child actually shrink below its content
    // size; without it this pane refuses to become the scroller.
    const content = document.createElement("div");
    content.className = cn("zen-min-h-0 zen-flex-1 zen-overflow-y-auto", !flush && "zen-p-4");
    content.replaceChildren(...toNodes(current.children as Child));
    parts.push(content);

    if (current.footer !== undefined && current.footer !== null && current.footer !== false) {
      const foot = document.createElement("div");
      foot.className = "zen-shrink-0";
      foot.replaceChildren(...toNodes(current.footer));
      parts.push(foot);
    }

    el.replaceChildren(...parts);

    const rest: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(current)) {
      if (!PAGE_OWN.has(k)) rest[k] = v;
    }
    if (current.style !== undefined) rest.style = current.style;
    removeProps?.();
    removeProps = applyProps(el, rest);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/* --------------------------------- Bar --------------------------------- */

export interface BarProps extends BaseProps {
  startContent?: Child;
  /** Centred regardless of how wide start/end are — that is the point of Bar. */
  middleContent?: Child;
  endContent?: Child;
  design?: "header" | "subheader" | "footer";
}

const BAR_DESIGN: Record<NonNullable<BarProps["design"]>, string> = {
  header: "zen-border-b zen-border-zen-border zen-bg-zen-background",
  subheader: "zen-border-b zen-border-zen-border zen-bg-zen-muted",
  footer: "zen-border-t zen-border-zen-border zen-bg-zen-background",
};

const BAR_OWN = new Set([
  "startContent",
  "middleContent",
  "endContent",
  "design",
  "class",
  "children",
  "style",
]);

export function Bar(props: BarProps = {}): ZenComponent<BarProps> {
  let current: BarProps = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const design = current.design ?? "header";
    el.className = cn(
      "zen-flex zen-w-full zen-items-center zen-gap-2 zen-px-4 zen-py-2",
      BAR_DESIGN[design],
      current.class,
    );

    const parts: Node[] = [];

    // Equal flex-1 on the outer slots is what keeps middle optically centred
    // when start and end differ in width. min-w-0 lets them truncate rather
    // than shove the middle off-centre.
    const start = document.createElement("div");
    start.className = "zen-flex zen-min-w-0 zen-flex-1 zen-items-center zen-gap-2";
    start.replaceChildren(...toNodes(current.startContent));
    parts.push(start);

    if (
      current.middleContent !== undefined &&
      current.middleContent !== null &&
      current.middleContent !== false
    ) {
      const middle = document.createElement("div");
      middle.className = "zen-flex zen-min-w-0 zen-shrink-0 zen-items-center zen-gap-2";
      middle.replaceChildren(...toNodes(current.middleContent));
      parts.push(middle);
    }

    const end = document.createElement("div");
    end.className = "zen-flex zen-min-w-0 zen-flex-1 zen-items-center zen-justify-end zen-gap-2";
    end.replaceChildren(...toNodes(current.endContent));
    parts.push(end);

    el.replaceChildren(...parts);

    const rest: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(current)) {
      if (!BAR_OWN.has(k)) rest[k] = v;
    }
    if (current.style !== undefined) rest.style = current.style;
    removeProps?.();
    removeProps = applyProps(el, rest);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

export { BAR_DESIGN };
