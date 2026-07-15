import * as React from "react";
import {
  VIRTUAL_SCROLL_WINDOW_PAGE_SIZE,
  type PivotFilterOptionsWindow,
} from "@algorisys/zen-ui-core/virtual-window";
import {
  isFilterActive,
  isValueSelected,
  type PivotFilterOptionsBody,
  type PivotFilterSelection,
} from "@algorisys/zen-ui-core/pivot";
import { cn } from "../../lib/cn";
import { Icon } from "../icon/icon";
import { Input } from "../form/input/input";
import { Loading } from "../loading/loading";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import { useWindowedOptionPages } from "./internal/use-windowed-option-pages";
import { WindowedVirtualList } from "./internal/windowed-virtual-list";

/**
 * PivotFilterMenu — pick values for one field, paged in from the server.
 *
 * Mirrors the Solid binding's API. `selection` is a value here where Solid takes
 * an accessor — the same framework-idiom split as className/class, and the only
 * one.
 *
 * Built on this binding's Popover rather than a hand-positioned panel: it brings
 * placement, collision flipping, Escape, click-outside and focus return with it,
 * all of which the panel would otherwise reimplement.
 */

export interface PivotFilterMenuProps {
  columnKey: string;
  label: string;
  selection?: PivotFilterSelection;
  formatValue?: (value: string) => string;
  onChange: (selection: PivotFilterSelection | null) => void;
  loadOptions?: (
    columnKey: string,
    optionSearch: string,
    pagination?: { offset: number; limit: number },
  ) => Promise<PivotFilterOptionsBody>;
  triggerClassName?: string;
  triggerChildren?: React.ReactNode;
  singleSelect?: boolean;
}

export const PivotFilterMenu: React.FC<PivotFilterMenuProps> = ({
  columnKey,
  label,
  selection,
  formatValue,
  onChange,
  loadOptions,
  triggerClassName,
  triggerChildren,
  singleSelect,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const active = isFilterActive(selection);

  const loadPage = React.useCallback(
    async (offset: number, limit: number, optionSearch: string) => {
      if (!loadOptions) return { values: [], hasMore: false, total: 0 };
      const res = await loadOptions(columnKey, optionSearch, { offset, limit });
      return { values: res.values, hasMore: res.hasMore, total: res.total ?? res.values.length };
    },
    [loadOptions, columnKey],
  );

  const pages = useWindowedOptionPages({
    pageSize: VIRTUAL_SCROLL_WINDOW_PAGE_SIZE,
    isActive: open,
    search,
    loadPage,
  });

  const toggle = (value: string) => {
    if (singleSelect) {
      onChange({ kind: "include", values: [value] });
      return;
    }
    const sel = selection;
    if (!sel || sel.kind === "all") {
      // No filter means everything is selected, so the first click is a
      // DESELECT: it excludes. Treating it as "include this one" would silently
      // invert what the user asked for.
      const exclude = sel?.kind === "all" ? sel.exclude : [];
      const next = exclude.includes(value) ? exclude.filter((v) => v !== value) : [...exclude, value];
      if (next.length === 0) onChange(null);
      else onChange({ kind: "all", exclude: next, ...(sel?.kind === "all" && sel.optionSearch ? { optionSearch: sel.optionSearch } : {}) });
      return;
    }
    const values = sel.values.includes(value) ? sel.values.filter((v) => v !== value) : [...sel.values, value];
    onChange(values.length === 0 ? null : { kind: "include", values });
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setSearch("");
          pages.openPanelFetch();
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Filter ${label}`}
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-1 zen-transition-colors",
            active
              ? "zen-text-zen-primary hover:zen-bg-zen-muted"
              : "zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
            triggerClassName,
          )}
        >
          {triggerChildren ?? <Icon name="chevron-down" className="zen-h-3.5 zen-w-3.5" />}
        </button>
      </PopoverTrigger>

      <PopoverContent className="zen-w-72 zen-p-2" align="start">
        <div className="zen-flex zen-flex-col zen-gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${label}`}
            aria-label={`Search ${label} values`}
            autoFocus
            className="zen-h-8"
          />

          {pages.loading ? (
            <div className="zen-flex zen-items-center zen-justify-center zen-py-6" aria-busy>
              <Loading size="sm" label="Loading values…" />
            </div>
          ) : pages.loadError ? (
            // A failed fetch is NOT an empty result. Saying "No matching values"
            // here sends people looking for data that is not missing.
            <div className="zen-flex zen-flex-col zen-items-start zen-gap-1 zen-px-2 zen-py-3" role="alert">
              <p className="zen-m-0 zen-text-sm zen-text-zen-error">Could not load values.</p>
              <button
                type="button"
                className="zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0 zen-text-xs zen-text-zen-primary hover:zen-underline"
                onClick={() => pages.openPanelFetch()}
              >
                Try again
              </button>
            </div>
          ) : pages.totalCount === 0 ? (
            <p className="zen-m-0 zen-px-2 zen-py-1.5 zen-text-sm zen-text-zen-muted-fg">No matching values</p>
          ) : (
            <WindowedVirtualList
              label={label}
              totalCount={pages.totalCount}
              optionsWindows={pages.optionsWindows as PivotFilterOptionsWindow[]}
              isSelected={(v) => isValueSelected(selection, v)}
              onToggle={toggle}
              onVisibleRange={pages.handleVisibleRange}
              formatValue={formatValue}
              singleSelect={singleSelect}
            />
          )}

          {active ? (
            <button
              type="button"
              className="zen-cursor-pointer zen-self-start zen-border-0 zen-bg-transparent zen-p-0 zen-text-xs zen-text-zen-primary hover:zen-underline"
              onClick={() => onChange(null)}
            >
              Clear filter
            </button>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
};
PivotFilterMenu.displayName = "PivotFilterMenu";
