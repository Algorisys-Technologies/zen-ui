import * as React from "react";
import { cn } from "@algorisys/zen-ui-core";
import { Button } from "../button/button";
import { SelectDialog } from "../select-dialog/select-dialog";

/**
 * FilterBar — the structured filter area above a table. The gap analysis
 * calls the List Report unbuildable without it.
 *
 * Fields are data, not children: Solid cannot read a child's props the way
 * React.Children can, so a compound API could not build the "Adapt filters"
 * list in both bindings from the same source. `render` keeps the control itself
 * arbitrary.
 *
 *   <FilterBar
 *     fields={[{ id: "supplier", label: "Supplier", render: () => <Input /> }]}
 *     onGo={runQuery}
 *   />
 *
 * "Adapt filters" is a SelectDialog over the field labels — picking which
 * filters are visible is exactly a searchable multi-select, so it would be odd
 * to build a second one.
 *
 * This bar collects and reveals; it does not filter. `onGo` is the caller's cue
 * to run the query, because only the caller knows what the controls mean.
 */

export interface FilterBarField {
  id: string;
  label: string;
  /** The control for this filter. */
  render: () => React.ReactNode;
  /** Kept off the bar until the user adds it via Adapt filters. */
  hiddenByDefault?: boolean;
}

/**
 * The prefix goes before the bracket. An unprefixed `[prop:value]` matches
 * nothing under ZEN_PREFIX and emits no CSS at all, which left the fields
 * stacked full-width under a perfectly green build.
 */
const FIELD_GRID = "zen-[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]";

export interface FilterBarProps {
  fields: FilterBarField[];
  /** Run the query. Without it, the Go button is not rendered. */
  onGo?: () => void;
  /** Clear the controls. Without it, the Clear button is not rendered. */
  onClear?: () => void;
  /** Slot for a variant / saved-view control. */
  variant?: React.ReactNode;
  /** Controlled visible field ids. Uncontrolled default: everything not `hiddenByDefault`. */
  visibleIds?: string[];
  onVisibleIdsChange?: (ids: string[]) => void;
  /** The Adapt filters affordance. Default: true. */
  adaptable?: boolean;
  /** The collapse chevron. Default: true. */
  collapsible?: boolean;
  defaultExpanded?: boolean;
  goLabel?: string;
  clearLabel?: string;
  adaptLabel?: string;
  className?: string;
}

export const FilterBar = ({
  fields,
  onGo,
  onClear,
  variant,
  visibleIds: visibleProp,
  onVisibleIdsChange,
  adaptable = true,
  collapsible = true,
  defaultExpanded = true,
  goLabel = "Go",
  clearLabel = "Clear",
  adaptLabel = "Adapt filters",
  className,
}: FilterBarProps) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [adaptOpen, setAdaptOpen] = React.useState(false);
  const [internal, setInternal] = React.useState<string[]>(() =>
    fields.filter((f) => !f.hiddenByDefault).map((f) => f.id),
  );

  const isControlled = visibleProp !== undefined;
  const visible = isControlled ? visibleProp : internal;

  const setVisible = (ids: string[]) => {
    if (!isControlled) setInternal(ids);
    onVisibleIdsChange?.(ids);
  };

  // Field order is the caller's, not the order the user ticked them in Adapt.
  const shown = fields.filter((f) => visible.includes(f.id));

  return (
    <div
      className={cn(
        "zen-flex zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-4 zen-py-3",
        className,
      )}
    >
      <div className="zen-flex zen-items-center zen-gap-2">
        {collapsible ? (
          <button
            type="button"
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse filters" : "Expand filters"}
            onClick={() => setExpanded((v) => !v)}
            className="zen-inline-flex zen-h-7 zen-w-7 zen-shrink-0 zen-cursor-pointer zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={cn("zen-transition-transform", expanded && "zen-rotate-90")}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ) : null}
        {variant}
        <div className="zen-ml-auto zen-flex zen-items-center zen-gap-2">
          {adaptable ? (
            <Button
              type="button"
              variant="ghost"
              color="neutral"
              size="sm"
              onClick={() => setAdaptOpen(true)}
            >
              {adaptLabel}
            </Button>
          ) : null}
          {onClear ? (
            <Button type="button" variant="outline" color="neutral" size="sm" onClick={onClear}>
              {clearLabel}
            </Button>
          ) : null}
          {onGo ? (
            <Button type="button" size="sm" onClick={onGo}>
              {goLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {expanded ? (
        shown.length ? (
          <div className={cn("zen-grid zen-gap-3", FIELD_GRID)}>
            {shown.map((f) => (
              <label key={f.id} className="zen-flex zen-flex-col zen-gap-1">
                <span className="zen-text-xs zen-font-medium zen-text-zen-muted-fg">{f.label}</span>
                {f.render()}
              </label>
            ))}
          </div>
        ) : (
          <p className="zen-m-0 zen-py-2 zen-text-sm zen-text-zen-muted-fg">
            No filters shown. Use {adaptLabel} to add some.
          </p>
        )
      ) : null}

      {adaptable ? (
        <SelectDialog
          open={adaptOpen}
          onOpenChange={setAdaptOpen}
          title={adaptLabel}
          description="Choose which filters appear on the bar."
          items={fields.map((f) => ({ id: f.id, label: f.label }))}
          multiple
          selectedIds={visible}
          onConfirm={setVisible}
        />
      ) : null}
    </div>
  );
};
FilterBar.displayName = "FilterBar";
