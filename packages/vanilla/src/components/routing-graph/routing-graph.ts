import { canAddLink, effectiveLinks, routingLayout, type RoutingLayout, type RoutingLink } from "@algorisys/zen-ui-core/routing";
import { observeDocumentDirection } from "@algorisys/zen-ui-core";
import type { MessageKey } from "@algorisys/zen-ui-core/messages";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type AnyZenComponent, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale, withLocale } from "../locale/locale";
import { NativeSelect } from "../form/native-select/native-select";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";

/**
 * RoutingGraph — a process's steps and the links between them: "this step
 * may start once that one is done". Read-only with step status for the
 * operator; editable for the engineer.
 *
 *   const graph = RoutingGraph({
 *     steps: template.steps, links,
 *     onLinksChange: (next) => graph.update({ links: next }),
 *   });
 *
 * Laid out left to right by longest path, so a step sits after everything it
 * waits for and parallel branches line up. With no links the steps run in
 * order (the implicit chain, drawn dashed).
 *
 * Editing is done on the selected step, not by dragging: its panel lists what
 * it runs after, each with a remove button, and a picker offers only steps
 * that would not close a loop. That works the same with a keyboard and a
 * screen reader as with a mouse. While the routing is still the implicit
 * chain, the first edit writes the chain out as real links before applying
 * itself — otherwise adding one link would silently drop all the others.
 *
 * Like every controlled prop in this binding, `links` changes only when the
 * caller passes new ones through `update()`.
 */

export type RoutingStepStatus = "done" | "active" | "pending" | "blocked" | "skipped";

export interface RoutingStep {
  id: string;
  label: string;
  /** A second line: a workstation, a time. */
  detail?: string;
  status?: RoutingStepStatus;
}

export interface RoutingGraphProps extends Omit<BaseProps, "children"> {
  steps: RoutingStep[];
  links: RoutingLink[];
  /** Makes the routing editable. */
  onLinksChange?: (links: RoutingLink[]) => void;
  selected?: string;
  onSelect?: (id: string | undefined) => void;
  /** Names the graph. Defaults to "Routing". */
  label?: string;
}

const STATUS_KEY: Record<RoutingStepStatus, MessageKey> = {
  done: "routing.status.done",
  active: "routing.status.active",
  pending: "routing.status.pending",
  blocked: "routing.status.blocked",
  skipped: "routing.status.skipped",
};

const STATUS: Record<RoutingStepStatus, string> = {
  done: "zen-border-zen-success zen-bg-zen-success-soft",
  active: "zen-border-zen-primary zen-bg-zen-primary-soft",
  pending: "zen-border-zen-border zen-bg-zen-background",
  blocked: "zen-border-zen-error zen-bg-zen-error-soft",
  skipped: "zen-border-dashed zen-border-zen-border zen-bg-zen-muted",
};

const SVG_NS = "http://www.w3.org/2000/svg";

let uid = 0;

const node = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
};

export function RoutingGraph(props: RoutingGraphProps): ZenComponent<RoutingGraphProps> {
  let current: RoutingGraphProps = { ...props };
  const loc = useLocale();
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;
  let owned: AnyZenComponent[] = [];
  const keep = <T extends AnyZenComponent>(c: T): T => (owned.push(c), c);
  const arrowId = `zen-routing-${++uid}-arrow`;

  let own: string | undefined = props.selected;
  let pick = "";
  let layout: RoutingLayout<RoutingStep> = routingLayout(current.steps, current.links);

  const selectedOf = () => current.selected ?? own;
  const select = (id: string | undefined) => {
    own = id;
    current.onSelect?.(id);
    render();
  };
  // Edits start from the links in force: the implicit chain is written out first.
  const base = () => effectiveLinks(current.steps, current.links).links;

  const root = node("div");
  const implicitNote = node("p", "zen-m-0 zen-text-sm zen-text-zen-muted-fg");
  const scroller = node("div", "zen-w-full zen-overflow-x-auto");
  const canvas = node("div");
  canvas.setAttribute("role", "group");
  scroller.append(canvas);

  // Coordinates are physical (left-based), so the overlay is anchored left, not at "start".
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "zen-pointer-events-none zen-absolute zen-left-0 zen-top-0");
  svg.setAttribute("aria-hidden", "true");
  const defs = document.createElementNS(SVG_NS, "defs");
  const marker = document.createElementNS(SVG_NS, "marker");
  for (const [k, v] of [
    ["id", arrowId],
    ["viewBox", "0 0 10 10"],
    ["refX", "1"],
    ["refY", "5"],
    ["markerWidth", "7"],
    ["markerHeight", "7"],
    ["orient", "auto-start-reverse"],
  ]) {
    marker.setAttribute(k, v);
  }
  const head = document.createElementNS(SVG_NS, "path");
  head.setAttribute("d", "M0 0 L10 5 L0 10 z");
  head.setAttribute("fill", "var(--zen-color-muted-fg)");
  marker.append(head);
  defs.append(marker);
  svg.append(defs);
  const lines = document.createElementNS(SVG_NS, "g");
  svg.append(lines);

  /** Curves with arrowheads between the measured cards. */
  const measure = () => {
    const box = canvas.getBoundingClientRect();
    const rectOf = (id: string) => canvas.querySelector<HTMLElement>(["[data-step=\"", CSS.escape(id), "\"]"].join(""))?.getBoundingClientRect();
    const layerOf = new Map<string, number>();
    layout.layers.forEach((layer, i) => layer.forEach((s) => layerOf.set(s.id, i)));
    const paths: SVGPathElement[] = [];
    let lane = 0;
    for (const l of layout.links) {
      const a = rectOf(l.from);
      const b = rectOf(l.to);
      if (!a || !b) continue;
      const ltr = a.left < b.left;
      const dir = ltr ? 1 : -1;
      const x1 = (ltr ? a.right : a.left) - box.left;
      const x2 = (ltr ? b.left - 6 : b.right + 6) - box.left; // room for the arrowhead
      const y1 = a.top + a.height / 2 - box.top;
      const y2 = b.top + b.height / 2 - box.top;
      const span = Math.abs((layerOf.get(l.to) ?? 0) - (layerOf.get(l.from) ?? 0));
      let d: string;
      if (span <= 1) {
        const mid = (x1 + x2) / 2;
        d = ["M", x1, y1, "C", mid, y1, mid, y2, x2, y2].join(" ");
      } else {
        // A link that skips a column would pass behind the cards in it, and seem
        // to end there. It goes over the top instead, each in its own lane.
        const y = 6 + 6 * lane++;
        const r = 18 * dir;
        d = ["M", x1, y1, "C", x1 + r, y1, x1 + r, y, x1 + 2 * r, y, "L", x2 - 2 * r, y, "C", x2 - r, y, x2 - r, y2, x2, y2].join(" ");
      }
      const p = document.createElementNS(SVG_NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", "var(--zen-color-muted-fg)");
      p.setAttribute("stroke-width", "1.5");
      if (layout.implicit) p.setAttribute("stroke-dasharray", "5 4");
      p.setAttribute("marker-end", ["url(#", arrowId, ")"].join(""));
      paths.push(p);
    }
    svg.setAttribute("width", String(canvas.scrollWidth));
    svg.setAttribute("height", String(canvas.scrollHeight));
    lines.replaceChildren(...paths);
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

  const render = () => withLocale(loc, renderNow);
  function renderNow(): void {
    for (const c of owned) c.destroy();
    owned = [];
    const {
      steps,
      links,
      onLinksChange,
      selected: _selected,
      onSelect: _onSelect,
      label,
      class: className,
      ...rest
    } = current;
    const editable = onLinksChange !== undefined;
    layout = routingLayout(steps, links);
    const selected = selectedOf();
    const name = (id: string) => steps.find((s) => s.id === id)?.label ?? id;
    const before = (id: string) => layout.links.filter((l) => l.to === id).map((l) => l.from);
    const after = (id: string) => layout.links.filter((l) => l.from === id).map((l) => l.to);
    const statusText = (s: RoutingStep) => loc.t(STATUS_KEY[s.status ?? "pending"]);

    root.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-3", className);
    removeProps?.();
    removeProps = applyProps(root, rest as Record<string, unknown>);

    // Links that skip a column run over the top; leave them headroom.
    const at = new Map<string, number>();
    layout.layers.forEach((layer, i) => layer.forEach((x) => at.set(x.id, i)));
    const longLinks = layout.links.filter((l) => Math.abs((at.get(l.to) ?? 0) - (at.get(l.from) ?? 0)) > 1).length;

    implicitNote.textContent = loc.t("routing.implicit");
    canvas.className = cn(
      "zen-relative zen-flex zen-w-max zen-min-w-full zen-items-stretch zen-gap-14 zen-p-1",
      longLinks > 0 && "zen-pt-10",
    );
    canvas.setAttribute("aria-label", label ?? loc.t("routing.label"));

    // Rebuilding the cards would drop focus from the one just pressed; put it back.
    const active = document.activeElement;
    const hadFocus = active instanceof HTMLElement && canvas.contains(active) ? active.getAttribute("data-step") : null;

    const columns = layout.layers.map((layer) => {
      const col = node("div", "zen-relative zen-flex zen-w-44 zen-shrink-0 zen-flex-col zen-justify-center zen-gap-3");
      for (const s of layer) {
        const step = steps.find((x) => x.id === s.id) as RoutingStep;
        const button = node(
          "button",
          cn(
            "zen-relative zen-z-10 zen-flex zen-min-h-12 zen-w-full zen-flex-col zen-items-start zen-gap-0.5 zen-rounded-zen-md zen-border zen-border-solid zen-px-3 zen-py-2 zen-text-start zen-text-zen-foreground zen-cursor-pointer",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
            STATUS[step.status ?? "pending"],
            selected === s.id && "zen-ring-2 zen-ring-zen-foreground",
          ),
        );
        button.type = "button";
        button.setAttribute("data-step", s.id);
        button.setAttribute("aria-pressed", String(selected === s.id));
        button.setAttribute(
          "aria-label",
          loc.t("routing.step", {
            name: step.label,
            status: statusText(step),
            after: before(s.id).map(name).join(", ") || loc.t("routing.none"),
            then: after(s.id).map(name).join(", ") || loc.t("routing.none"),
          }),
        );
        button.append(node("span", "zen-text-sm zen-font-semibold", step.label));
        const sub = node("span", "zen-flex zen-items-center zen-gap-1 zen-text-xs");
        if (step.status === "done") sub.append(keep(Icon({ name: "check", size: 12 })).el);
        if (step.status === "blocked") sub.append(keep(Icon({ name: "warn", size: 12 })).el);
        sub.append(step.detail ?? statusText(step));
        button.append(sub);
        button.addEventListener("click", () => select(selectedOf() === s.id ? undefined : s.id));
        col.append(button);
      }
      return col;
    });
    canvas.replaceChildren(svg, ...columns);

    const out: Node[] = [];
    if (layout.implicit) out.push(implicitNote);
    out.push(scroller);

    const panel = selected !== undefined && steps.some((s) => s.id === selected) ? selected : undefined;
    if (panel !== undefined) {
      const section = node(
        "section",
        "zen-flex zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-p-zen-card",
      );
      section.setAttribute("aria-label", name(panel));
      section.append(node("h4", "zen-m-0 zen-text-base zen-font-semibold zen-text-zen-foreground", name(panel)));

      const runsAfter = node("div", "zen-flex zen-flex-col zen-gap-1.5");
      runsAfter.append(
        node("span", "zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", loc.t("routing.runsAfter")),
      );
      const froms = before(panel);
      if (froms.length) {
        const ul = node("ul", "zen-m-0 zen-flex zen-list-none zen-flex-wrap zen-gap-2 zen-p-0");
        for (const from of froms) {
          const li = node(
            "li",
            "zen-inline-flex zen-items-center zen-gap-1 zen-rounded-zen-full zen-border zen-border-solid zen-border-zen-border zen-py-0.5 zen-ps-3 zen-pe-1 zen-text-sm",
            name(from),
          );
          if (editable) {
            const remove = node(
              "button",
              "zen-inline-flex zen-h-7 zen-w-7 zen-items-center zen-justify-center zen-rounded-zen-full zen-border-0 zen-bg-transparent zen-text-zen-muted-fg zen-cursor-pointer hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            );
            remove.type = "button";
            remove.setAttribute("aria-label", loc.t("routing.remove", { step: name(panel), after: name(from) }));
            remove.append(keep(Icon({ name: "x", size: 14 })).el);
            remove.addEventListener("click", () =>
              current.onLinksChange?.(base().filter((l) => !(l.from === from && l.to === panel))),
            );
            li.append(remove);
          }
          ul.append(li);
        }
        runsAfter.append(ul);
      } else {
        runsAfter.append(node("span", "zen-text-sm", loc.t("routing.start")));
      }
      section.append(runsAfter);

      if (editable) {
        const candidates = steps.filter((s) => canAddLink(steps, base(), s.id, panel).ok);
        if (pick && !candidates.some((s) => s.id === pick)) pick = "";
        const row = node("div", "zen-flex zen-flex-wrap zen-items-end zen-gap-2");
        const fieldLabel = node(
          "label",
          "zen-flex zen-flex-col zen-gap-1 zen-text-xs zen-font-medium zen-text-zen-muted-fg",
          loc.t("routing.addAfter"),
        );
        const addButton = keep(
          Button({
            variant: "outline",
            disabled: !pick,
            children: loc.t("routing.add"),
            onClick: () => {
              if (!pick || !canAddLink(current.steps, base(), pick, panel).ok) return;
              const from = pick;
              pick = "";
              current.onLinksChange?.([...base(), { from, to: panel }]);
              render();
            },
          }),
        );
        const picker = keep(
          NativeSelect({
            class: "zen-min-w-48",
            value: pick,
            disabled: candidates.length === 0,
            options: [
              { value: "", label: candidates.length ? loc.t("routing.choose") : loc.t("routing.noCandidates") },
              ...candidates.map((s) => ({ value: s.id, label: s.label })),
            ],
            /* Not a re-render: that would rebuild the select under the user. */
            onChange: (v) => {
              pick = v;
              addButton.update({ disabled: !pick });
            },
          }),
        );
        fieldLabel.append(picker.el);
        row.append(fieldLabel, addButton.el);
        section.append(row);
      }

      const then = node("div", "zen-flex zen-flex-col zen-gap-1.5");
      then.append(
        node("span", "zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", loc.t("routing.then")),
        node("span", "zen-text-sm zen-text-zen-foreground", after(panel).map(name).join(", ") || loc.t("routing.end")),
      );
      section.append(then);
      out.push(section);
    }

    root.replaceChildren(...out);
    if (hadFocus !== null) canvas.querySelector<HTMLElement>(["[data-step=\"", CSS.escape(hadFocus), "\"]"].join(""))?.focus();
    schedule();
  }

  render();
  disposer.add(() => removeProps?.());

  return {
    el: root,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      for (const c of owned) c.destroy();
      owned = [];
      disposer.dispose();
      root.remove();
    },
  };
}
