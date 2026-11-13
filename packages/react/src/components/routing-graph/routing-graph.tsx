import * as React from "react";
import { canAddLink, effectiveLinks, routingLayout, type RoutingLink } from "@algorisys/zen-ui-core/routing";
import { observeDocumentDirection } from "@algorisys/zen-ui-core";
import type { MessageKey } from "@algorisys/zen-ui-core/messages";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";
import { NativeSelect } from "../form/native-select/native-select";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";

/**
 * RoutingGraph — a process's steps and the links between them: "this step
 * may start once that one is done". Read-only with step status for the
 * operator; editable for the engineer.
 *
 *   <RoutingGraph steps={template.steps} links={links} onLinksChange={setLinks} />
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
 */

export type RoutingStepStatus = "done" | "active" | "pending" | "blocked" | "skipped";

export interface RoutingStep {
  id: string;
  label: string;
  /** A second line: a workstation, a time. */
  detail?: string;
  status?: RoutingStepStatus;
}

export type RoutingGraphProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> & {
  steps: RoutingStep[];
  links: RoutingLink[];
  /** Makes the routing editable. */
  onLinksChange?: (links: RoutingLink[]) => void;
  selected?: string;
  onSelect?: (id: string | undefined) => void;
  /** Names the graph. Defaults to "Routing". */
  label?: string;
};

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

export const RoutingGraph = React.forwardRef<HTMLDivElement, RoutingGraphProps>(
  ({ steps, links, onLinksChange, selected: selectedProp, onSelect, label, className, ...rest }, ref) => {
    const loc = useLocale();
    // useId's ":r1:" / "«r1»" is not safe inside url(#…); keep the word characters.
    const uid = React.useId().replace(/[^A-Za-z0-9_-]/g, "");
    const editable = onLinksChange !== undefined;
    const layout = React.useMemo(() => routingLayout(steps, links), [steps, links]);
    const [own, setOwn] = React.useState<string | undefined>(selectedProp);
    const selected = selectedProp ?? own;
    const select = (id: string | undefined) => {
      setOwn(id);
      onSelect?.(id);
    };
    const name = (id: string) => steps.find((s) => s.id === id)?.label ?? id;
    const before = (id: string) => layout.links.filter((l) => l.to === id).map((l) => l.from);
    const after = (id: string) => layout.links.filter((l) => l.from === id).map((l) => l.to);
    const statusText = (s: RoutingStep) => loc.t(STATUS_KEY[s.status ?? "pending"]);

    // Edits start from the links in force: the implicit chain is written out first.
    const base = () => effectiveLinks(steps, links).links;
    const remove = (from: string, to: string) => onLinksChange?.(base().filter((l) => !(l.from === from && l.to === to)));
    const candidates = selected ? steps.filter((s) => canAddLink(steps, base(), s.id, selected).ok) : [];
    const [pick, setPick] = React.useState("");
    const add = () => {
      if (!selected || !pick || !canAddLink(steps, base(), pick, selected).ok) return;
      onLinksChange?.([...base(), { from: pick, to: selected }]);
      setPick("");
    };

    // Links that skip a column run over the top; leave them headroom.
    const longLinks = React.useMemo(() => {
      const at = new Map<string, number>();
      layout.layers.forEach((layer, i) => layer.forEach((x) => at.set(x.id, i)));
      return layout.links.filter((l) => Math.abs((at.get(l.to) ?? 0) - (at.get(l.from) ?? 0)) > 1).length;
    }, [layout]);

    // Curves with arrowheads between the measured cards.
    const canvas = React.useRef<HTMLDivElement>(null);
    const [paths, setPaths] = React.useState<{ key: string; d: string }[]>([]);
    const [size, setSize] = React.useState({ w: 0, h: 0 });
    // The observers are set up once; they read the layout in force through this.
    const layoutRef = React.useRef(layout);
    layoutRef.current = layout;
    const measure = React.useCallback(() => {
      const el = canvas.current;
      if (!el) return;
      const current = layoutRef.current;
      const box = el.getBoundingClientRect();
      const rectOf = (id: string) => el.querySelector<HTMLElement>(`[data-step="${CSS.escape(id)}"]`)?.getBoundingClientRect();
      const out: { key: string; d: string }[] = [];
      const layerOf = new Map<string, number>();
      current.layers.forEach((layer, i) => layer.forEach((s) => layerOf.set(s.id, i)));
      let lane = 0;
      for (const l of current.links) {
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
        if (span <= 1) {
          const mid = (x1 + x2) / 2;
          out.push({ key: [l.from, l.to].join(">"), d: ["M", x1, y1, "C", mid, y1, mid, y2, x2, y2].join(" ") });
          continue;
        }
        // A link that skips a column would pass behind the cards in it, and seem
        // to end there. It goes over the top instead, each in its own lane.
        const y = 6 + 6 * lane++;
        const r = 18 * dir;
        out.push({
          key: [l.from, l.to].join(">"),
          d: ["M", x1, y1, "C", x1 + r, y1, x1 + r, y, x1 + 2 * r, y, "L", x2 - 2 * r, y, "C", x2 - r, y, x2 - r, y2, x2, y2].join(" "),
        });
      }
      setSize({ w: el.scrollWidth, h: el.scrollHeight });
      setPaths(out);
    }, []);

    React.useEffect(() => {
      const ro = new ResizeObserver(() => measure());
      if (canvas.current) ro.observe(canvas.current);
      // Switching direction mirrors the layout without resizing it, so the
      // ResizeObserver never fires; the lines would stay where LTR put them.
      let frame = 0;
      const stopDir = observeDocumentDirection(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(measure);
      });
      return () => {
        ro.disconnect();
        stopDir();
        cancelAnimationFrame(frame);
      };
    }, [measure]);
    React.useEffect(() => {
      const frame = requestAnimationFrame(measure);
      return () => cancelAnimationFrame(frame);
    }, [layout, measure]);

    const arrowId = [uid, "arrow"].join("-");
    const panel = selected !== undefined && steps.some((s) => s.id === selected) ? selected : undefined;
    return (
      <div ref={ref} className={cn("zen-flex zen-w-full zen-flex-col zen-gap-3", className)} {...rest}>
        {layout.implicit && <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">{loc.t("routing.implicit")}</p>}
        <div className="zen-w-full zen-overflow-x-auto">
          <div
            ref={canvas}
            role="group"
            aria-label={label ?? loc.t("routing.label")}
            className={cn("zen-relative zen-flex zen-w-max zen-min-w-full zen-items-stretch zen-gap-14 zen-p-1", longLinks > 0 && "zen-pt-10")}
          >
            <svg className="zen-pointer-events-none zen-absolute zen-left-0 zen-top-0" width={size.w} height={size.h} aria-hidden="true">
              <defs>
                <marker id={arrowId} viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" fill="var(--zen-color-muted-fg)" />
                </marker>
              </defs>
              {paths.map((p) => (
                <path
                  key={p.key}
                  d={p.d}
                  fill="none"
                  stroke="var(--zen-color-muted-fg)"
                  strokeWidth="1.5"
                  strokeDasharray={layout.implicit ? "5 4" : undefined}
                  markerEnd={["url(#", arrowId, ")"].join("")}
                />
              ))}
            </svg>
            {layout.layers.map((layer, i) => (
              <div key={i} className="zen-relative zen-flex zen-w-44 zen-shrink-0 zen-flex-col zen-justify-center zen-gap-3">
                {layer.map((s) => {
                  const step = steps.find((x) => x.id === s.id) as RoutingStep;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      data-step={s.id}
                      aria-pressed={selected === s.id}
                      aria-label={loc.t("routing.step", {
                        name: step.label,
                        status: statusText(step),
                        after: before(s.id).map(name).join(", ") || loc.t("routing.none"),
                        then: after(s.id).map(name).join(", ") || loc.t("routing.none"),
                      })}
                      className={cn(
                        "zen-relative zen-z-10 zen-flex zen-min-h-12 zen-w-full zen-flex-col zen-items-start zen-gap-0.5 zen-rounded-zen-md zen-border zen-border-solid zen-px-3 zen-py-2 zen-text-start zen-text-zen-foreground zen-cursor-pointer",
                        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                        STATUS[step.status ?? "pending"],
                        selected === s.id && "zen-ring-2 zen-ring-zen-foreground",
                      )}
                      onClick={() => select(selected === s.id ? undefined : s.id)}
                    >
                      <span className="zen-text-sm zen-font-semibold">{step.label}</span>
                      <span className="zen-flex zen-items-center zen-gap-1 zen-text-xs">
                        {step.status === "done" && <Icon name="check" size={12} />}
                        {step.status === "blocked" && <Icon name="warn" size={12} />}
                        {step.detail ?? statusText(step)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {panel !== undefined && (
          <section
            className="zen-flex zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-p-zen-card"
            aria-label={name(panel)}
          >
            <h4 className="zen-m-0 zen-text-base zen-font-semibold zen-text-zen-foreground">{name(panel)}</h4>
            <div className="zen-flex zen-flex-col zen-gap-1.5">
              <span className="zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">{loc.t("routing.runsAfter")}</span>
              {before(panel).length ? (
                <ul className="zen-m-0 zen-flex zen-list-none zen-flex-wrap zen-gap-2 zen-p-0">
                  {before(panel).map((from) => (
                    <li
                      key={from}
                      className="zen-inline-flex zen-items-center zen-gap-1 zen-rounded-zen-full zen-border zen-border-solid zen-border-zen-border zen-py-0.5 zen-ps-3 zen-pe-1 zen-text-sm"
                    >
                      {name(from)}
                      {editable && (
                        <button
                          type="button"
                          aria-label={loc.t("routing.remove", { step: name(panel), after: name(from) })}
                          className="zen-inline-flex zen-h-7 zen-w-7 zen-items-center zen-justify-center zen-rounded-zen-full zen-border-0 zen-bg-transparent zen-text-zen-muted-fg zen-cursor-pointer hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
                          onClick={() => remove(from, panel)}
                        >
                          <Icon name="x" size={14} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="zen-text-sm">{loc.t("routing.start")}</span>
              )}
            </div>
            {editable && (
              <div className="zen-flex zen-flex-wrap zen-items-end zen-gap-2">
                <label className="zen-flex zen-flex-col zen-gap-1 zen-text-xs zen-font-medium zen-text-zen-muted-fg">
                  {loc.t("routing.addAfter")}
                  <NativeSelect
                    className="zen-min-w-48"
                    value={pick}
                    disabled={candidates.length === 0}
                    onChange={(e) => setPick(e.currentTarget.value)}
                  >
                    <option value="">{candidates.length ? loc.t("routing.choose") : loc.t("routing.noCandidates")}</option>
                    {candidates.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </NativeSelect>
                </label>
                <Button variant="outline" disabled={!pick} onClick={add}>
                  {loc.t("routing.add")}
                </Button>
              </div>
            )}
            <div className="zen-flex zen-flex-col zen-gap-1.5">
              <span className="zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">{loc.t("routing.then")}</span>
              <span className="zen-text-sm zen-text-zen-foreground">{after(panel).map(name).join(", ") || loc.t("routing.end")}</span>
            </div>
          </section>
        )}
      </div>
    );
  },
);
RoutingGraph.displayName = "RoutingGraph";
