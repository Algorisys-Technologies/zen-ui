import { type JSX, For, Show, createEffect, createMemo, createSignal, on, onCleanup, onMount, splitProps, untrack } from "solid-js";
import { traceGenealogy, type GenealogyEdge } from "@algorisys/zen-ui-core/genealogy";
import { observeDocumentDirection } from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";

/**
 * GenealogyGraph — trace a lot, order or unit both ways: where it came from
 * (left) and where it went (right). The view a recall or a complaint starts
 * with.
 *
 *   <GenealogyGraph
 *     nodes={[{ id: "LOT-77", label: "LOT-77", kind: "Material lot" }, …]}
 *     edges={[{ from: "LOT-77", to: "WO-10042" }, …]}   // input → what it went into
 *     defaultFocus="WO-10042"
 *   />
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

export type GenealogyGraphProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
  nodes: GenealogyNode[];
  edges: GenealogyEdge[];
  focus?: string;
  defaultFocus?: string;
  onFocusChange?: (id: string) => void;
  /** Levels each way. Default 3. */
  maxDepth?: number;
};

export const GenealogyGraph = (props: GenealogyGraphProps) => {
  const [local, rest] = splitProps(props, ["nodes", "edges", "focus", "defaultFocus", "onFocusChange", "maxDepth", "class"]);
  const loc = useLocale();
  const [own, setOwn] = createSignal(untrack(() => local.defaultFocus ?? local.nodes[0]?.id ?? ""));
  const focus = () => local.focus ?? own();
  const trace = createMemo(() => traceGenealogy(local.nodes, local.edges, focus(), { maxDepth: local.maxDepth ?? 3 }));
  const byId = createMemo(() => new Map(local.nodes.map((n) => [n.id, n])));
  const name = (id: string) => byId().get(id)?.label ?? id;

  const choose = (id: string) => {
    setOwn(id);
    local.onFocusChange?.(id);
  };

  const heading = (level: number) =>
    level === 0
      ? loc.t("genealogy.focus")
      : level < 0
        ? `${loc.t("genealogy.upstream")} · ${loc.t("genealogy.levelUp", { count: -level })}`
        : `${loc.t("genealogy.downstream")} · ${loc.t("genealogy.levelDown", { count: level })}`;
  const describe = (id: string) => {
    const from = local.edges.filter((e) => e.to === id).map((e) => name(e.from));
    const into = local.edges.filter((e) => e.from === id).map((e) => name(e.to));
    const n = byId().get(id);
    return loc.t("genealogy.node", {
      name: [n?.kind, n?.label ?? id].filter(Boolean).join(" "),
      from: from.length ? from.join(", ") : loc.t("genealogy.none"),
      into: into.length ? into.join(", ") : loc.t("genealogy.none"),
    });
  };

  // Lines between the cards, from their measured boxes. Coordinates are
  // physical (left-based), so the overlay is anchored left, not at "start".
  let canvas: HTMLDivElement | undefined;
  const [paths, setPaths] = createSignal<{ key: string; d: string }[]>([]);
  const [size, setSize] = createSignal({ w: 0, h: 0 });
  const measure = () => {
    if (!canvas) return;
    const box = canvas.getBoundingClientRect();
    const rectOf = (id: string) => canvas!.querySelector<HTMLElement>(`[data-node="${CSS.escape(id)}"]`)?.getBoundingClientRect();
    const out: { key: string; d: string }[] = [];
    for (const e of trace().edges) {
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
      out.push({ key: [e.from, e.to].join(">"), d: ["M", x1, y1, "C", mid, y1, mid, y2, x2, y2].join(" ") });
    }
    setSize({ w: canvas.scrollWidth, h: canvas.scrollHeight });
    setPaths(out);
  };
  onMount(() => {
    const ro = new ResizeObserver(() => measure());
    if (canvas) ro.observe(canvas);
    // Switching direction mirrors the layout without resizing it, so the
    // ResizeObserver never fires; the lines would stay where LTR put them.
    const stopDir = observeDocumentDirection(() => requestAnimationFrame(measure));
    onCleanup(() => {
      ro.disconnect();
      stopDir();
    });
  });
  createEffect(on(trace, () => requestAnimationFrame(measure)));

  return (
    <div class={cn("zen-w-full zen-overflow-x-auto", local.class)} {...rest}>
      <div ref={canvas} class="zen-relative zen-flex zen-w-max zen-min-w-full zen-items-stretch zen-gap-12 zen-p-1" role="group" aria-label={loc.t("genealogy.label", { name: name(focus()) })}>
        <svg class="zen-pointer-events-none zen-absolute zen-left-0 zen-top-0" width={size().w} height={size().h} aria-hidden="true">
          <For each={paths()}>{(p) => <path d={p.d} fill="none" stroke="var(--zen-color-border)" stroke-width="1.5" />}</For>
        </svg>
        <For each={trace().columns}>
          {(col) => (
            <section class="zen-relative zen-flex zen-w-48 zen-shrink-0 zen-flex-col zen-gap-2" aria-label={heading(col.level)}>
              <h4 class="zen-m-0 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">{heading(col.level)}</h4>
              <Show when={col.level < 0 && col.level === trace().columns[0].level && trace().cut.upstream > 0}>
                <p class="zen-m-0 zen-text-xs zen-font-medium zen-text-zen-warning-soft-fg">{loc.t("genealogy.cutUp", { count: trace().cut.upstream })}</p>
              </Show>
              <div class="zen-flex zen-flex-1 zen-flex-col zen-justify-center zen-gap-3">
                <For each={col.nodes}>
                  {(n) => {
                    const node = () => byId().get(n.id);
                    const isFocus = () => n.id === focus();
                    return (
                      <button
                        type="button"
                        data-node={n.id}
                        aria-current={isFocus() ? "true" : undefined}
                        aria-label={describe(n.id)}
                        class={cn(
                          "zen-relative zen-z-10 zen-flex zen-min-h-12 zen-w-full zen-flex-col zen-items-start zen-gap-0.5 zen-rounded-zen-md zen-border zen-border-solid zen-px-3 zen-py-2 zen-text-start zen-cursor-pointer",
                          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                          isFocus()
                            ? "zen-border-2 zen-border-zen-primary zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"
                            : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground hover:zen-bg-zen-muted",
                        )}
                        onClick={() => choose(n.id)}
                      >
                        <Show when={node()?.kind}>
                          <span class="zen-text-xs zen-opacity-80">{node()?.kind}</span>
                        </Show>
                        <span class="zen-font-mono zen-text-sm zen-font-semibold">{node()?.label ?? n.id}</span>
                        <Show when={node()?.detail}>
                          <span class="zen-text-xs">{node()?.detail}</span>
                        </Show>
                      </button>
                    );
                  }}
                </For>
              </div>
              <Show when={col.level > 0 && col.level === trace().columns[trace().columns.length - 1].level && trace().cut.downstream > 0}>
                <p class="zen-m-0 zen-text-xs zen-font-medium zen-text-zen-warning-soft-fg">{loc.t("genealogy.cutDown", { count: trace().cut.downstream })}</p>
              </Show>
            </section>
          )}
        </For>
      </div>
    </div>
  );
};
