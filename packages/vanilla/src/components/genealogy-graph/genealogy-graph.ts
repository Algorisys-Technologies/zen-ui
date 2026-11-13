import { traceGenealogy, type GenealogyEdge, type GenealogyTrace } from "@algorisys/zen-ui-core/genealogy";
import { observeDocumentDirection } from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";

/**
 * GenealogyGraph — trace a lot, order or unit both ways: where it came from
 * (left) and where it went (right). The view a recall or a complaint starts
 * with.
 *
 *   GenealogyGraph({
 *     nodes: [{ id: "LOT-77", label: "LOT-77", kind: "Material lot" }, …],
 *     edges: [{ from: "LOT-77", to: "WO-10042" }, …],   // input → what it went into
 *     defaultFocus: "WO-10042",
 *   }).el
 *
 * Each node sits at its shortest distance from the traced item. Clicking a
 * node traces from it instead — how an investigation actually moves. Past
 * `maxDepth` (3 by default) the trace is cut, and the cut is SAID ("4 more
 * further on"): a trace that silently stops looks complete, and in a recall
 * that is the worst possible failure.
 *
 * The lines are drawn over the laid-out cards from their measured positions,
 * so wrapping, resizing and right-to-left all follow. They are decoration for
 * sighted users; every card's accessible name says what it was made from and
 * what it went into.
 */

export interface GenealogyNode {
  id: string;
  label: string;
  /** What it is: "Material lot", "Work order", "Pallet". */
  kind?: string;
  /** A second line: a quantity, a date, a status. */
  detail?: string;
}

export interface GenealogyGraphProps extends Omit<BaseProps, "children"> {
  nodes: GenealogyNode[];
  edges: GenealogyEdge[];
  focus?: string;
  defaultFocus?: string;
  onFocusChange?: (id: string) => void;
  /** Levels each way. Default 3. */
  maxDepth?: number;
}

const SVG_NS = "http://www.w3.org/2000/svg";

const node = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
};

export function GenealogyGraph(props: GenealogyGraphProps): ZenComponent<GenealogyGraphProps> {
  let current: GenealogyGraphProps = { ...props };
  const loc = useLocale();
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  let own = props.defaultFocus ?? props.nodes[0]?.id ?? "";
  const focusOf = () => current.focus ?? own;
  let trace: GenealogyTrace<GenealogyNode> = traceGenealogy(current.nodes, current.edges, focusOf(), { maxDepth: current.maxDepth ?? 3 });

  const root = node("div");
  const canvas = node("div", "zen-relative zen-flex zen-w-max zen-min-w-full zen-items-stretch zen-gap-12 zen-p-1");
  canvas.setAttribute("role", "group");
  // Coordinates are physical (left-based), so the overlay is anchored left, not at "start".
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "zen-pointer-events-none zen-absolute zen-left-0 zen-top-0");
  svg.setAttribute("aria-hidden", "true");
  root.append(canvas);

  const choose = (id: string) => {
    own = id;
    current.onFocusChange?.(id);
    render();
  };

  /** Lines between the cards, from their measured boxes. */
  const measure = () => {
    const box = canvas.getBoundingClientRect();
    const rectOf = (id: string) => canvas.querySelector<HTMLElement>(["[data-node=\"", CSS.escape(id), "\"]"].join(""))?.getBoundingClientRect();
    const paths: SVGPathElement[] = [];
    for (const e of trace.edges) {
      const a = rectOf(e.from);
      const b = rectOf(e.to);
      if (!a || !b) continue;
      // Leave from the side facing the other card: right in LTR, left in RTL.
      const ltr = a.left < b.left;
      const x1 = (ltr ? a.right : a.left) - box.left;
      const x2 = (ltr ? b.left : b.right) - box.left;
      const y1 = a.top + a.height / 2 - box.top;
      const y2 = b.top + b.height / 2 - box.top;
      const mid = (x1 + x2) / 2;
      const p = document.createElementNS(SVG_NS, "path");
      p.setAttribute("d", ["M", x1, y1, "C", mid, y1, mid, y2, x2, y2].join(" "));
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", "var(--zen-color-border)");
      p.setAttribute("stroke-width", "1.5");
      paths.push(p);
    }
    svg.setAttribute("width", String(canvas.scrollWidth));
    svg.setAttribute("height", String(canvas.scrollHeight));
    svg.replaceChildren(...paths);
  };

  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
  };
  const ro = new ResizeObserver(() => measure());
  ro.observe(canvas);
  disposer.add(() => ro.disconnect());
  // Switching direction mirrors the layout without resizing it, so the
  // ResizeObserver never fires; the lines would stay where LTR put them.
  disposer.add(observeDocumentDirection(schedule));
  disposer.add(() => cancelAnimationFrame(frame));

  const render = () => {
    const { nodes, edges, focus: _focus, defaultFocus: _defaultFocus, onFocusChange: _onFocusChange, maxDepth, class: className, ...rest } = current;
    const focus = focusOf();
    trace = traceGenealogy(nodes, edges, focus, { maxDepth: maxDepth ?? 3 });
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const name = (id: string) => byId.get(id)?.label ?? id;

    const heading = (level: number) =>
      level === 0
        ? loc.t("genealogy.focus")
        : level < 0
          ? [loc.t("genealogy.upstream"), loc.t("genealogy.levelUp", { count: -level })].join(" · ")
          : [loc.t("genealogy.downstream"), loc.t("genealogy.levelDown", { count: level })].join(" · ");
    const describe = (id: string) => {
      const from = edges.filter((e) => e.to === id).map((e) => name(e.from));
      const into = edges.filter((e) => e.from === id).map((e) => name(e.to));
      const n = byId.get(id);
      return loc.t("genealogy.node", {
        name: [n?.kind, n?.label ?? id].filter(Boolean).join(" "),
        from: from.length ? from.join(", ") : loc.t("genealogy.none"),
        into: into.length ? into.join(", ") : loc.t("genealogy.none"),
      });
    };

    root.className = cn("zen-w-full zen-overflow-x-auto", className);
    removeProps?.();
    removeProps = applyProps(root, rest as Record<string, unknown>);
    canvas.setAttribute("aria-label", loc.t("genealogy.label", { name: name(focus) }));

    // Rebuilding the cards would drop focus from the one just clicked; put it back.
    const active = document.activeElement;
    const hadFocus = active instanceof HTMLElement && canvas.contains(active) ? active.getAttribute("data-node") : null;

    const first = trace.columns[0];
    const last = trace.columns[trace.columns.length - 1];
    const sections = trace.columns.map((col) => {
      const section = node("section", "zen-relative zen-flex zen-w-48 zen-shrink-0 zen-flex-col zen-gap-2");
      section.setAttribute("aria-label", heading(col.level));
      section.append(
        node("h4", "zen-m-0 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", heading(col.level)),
      );
      if (col.level < 0 && col.level === first.level && trace.cut.upstream > 0) {
        section.append(
          node("p", "zen-m-0 zen-text-xs zen-font-medium zen-text-zen-warning-soft-fg", loc.t("genealogy.cutUp", { count: trace.cut.upstream })),
        );
      }
      const stack = node("div", "zen-flex zen-flex-1 zen-flex-col zen-justify-center zen-gap-3");
      for (const n of col.nodes) {
        const data = byId.get(n.id);
        const isFocus = n.id === focus;
        const button = node(
          "button",
          cn(
            "zen-relative zen-z-10 zen-flex zen-min-h-12 zen-w-full zen-flex-col zen-items-start zen-gap-0.5 zen-rounded-zen-md zen-border zen-border-solid zen-px-3 zen-py-2 zen-text-start zen-cursor-pointer",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
            isFocus
              ? "zen-border-2 zen-border-zen-primary zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"
              : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground hover:zen-bg-zen-muted",
          ),
        );
        button.type = "button";
        button.setAttribute("data-node", n.id);
        if (isFocus) button.setAttribute("aria-current", "true");
        button.setAttribute("aria-label", describe(n.id));
        if (data?.kind) button.append(node("span", "zen-text-xs zen-opacity-80", data.kind));
        button.append(node("span", "zen-font-mono zen-text-sm zen-font-semibold", data?.label ?? n.id));
        if (data?.detail) button.append(node("span", "zen-text-xs", data.detail));
        button.addEventListener("click", () => choose(n.id));
        stack.append(button);
      }
      section.append(stack);
      if (col.level > 0 && col.level === last.level && trace.cut.downstream > 0) {
        section.append(
          node("p", "zen-m-0 zen-text-xs zen-font-medium zen-text-zen-warning-soft-fg", loc.t("genealogy.cutDown", { count: trace.cut.downstream })),
        );
      }
      return section;
    });
    canvas.replaceChildren(svg, ...sections);
    if (hadFocus !== null) canvas.querySelector<HTMLElement>(["[data-node=\"", CSS.escape(hadFocus), "\"]"].join(""))?.focus();
    schedule();
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el: root,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      root.remove();
    },
  };
}
