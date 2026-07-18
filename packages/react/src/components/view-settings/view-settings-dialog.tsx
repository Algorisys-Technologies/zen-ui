import * as React from "react";
import { cn } from "@algorisys/zen-ui-core";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../dialog/dialog";
import { Button } from "../button/button";
import { Switch } from "../form/switch/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs/tabs";
import { SelectListBody } from "../select-list/select-list";

/**
 * ViewSettingsDialog — sort / group / filter settings for a list or
 * table. The caller owns the data; this only collects the user's intent and
 * hands it back on OK.
 *
 * Panes are built from `select-list` rather than RadioGroup: "pick one sort
 * field" is the same list SelectDialog draws, the two bindings' RadioGroup APIs
 * diverge (React needs a sibling <label htmlFor>, Solid takes children), and
 * Solid's RadioGroupItem still lands a caller's id on the wrapper. Reusing the
 * list keeps the dialog family looking identical and sidesteps all of it.
 *
 * Only the sections you pass get a tab, and the tab strip disappears entirely
 * when there is just one — a single tab is a label pretending to be a choice.
 *
 * Nothing is committed until OK, so Cancel restores whatever `value` held when
 * the dialog opened. Reset clears the draft but still needs an OK: it is an
 * edit, not a second commit path.
 */

export interface ViewSettingsItem {
  id: string;
  label: string;
  /** Secondary line under the label. */
  description?: string;
}

export interface ViewSettingsFilterGroup {
  id: string;
  label: string;
  /** Checkbox rows. Default: true — filters are usually "any of these". */
  multiple?: boolean;
  items: ViewSettingsItem[];
}

export interface ViewSettingsValue {
  sortBy?: string | null;
  sortDescending?: boolean;
  groupBy?: string | null;
  groupDescending?: boolean;
  /** Filter group id → selected item ids. */
  filters?: Record<string, string[]>;
}

export interface ViewSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  /** Optional subtitle. Also the dialog's accessible description. */
  description?: string;
  sortItems?: ViewSettingsItem[];
  groupItems?: ViewSettingsItem[];
  filterGroups?: ViewSettingsFilterGroup[];
  /** The settings the dialog opens with. Read when `open` becomes true. */
  value?: ViewSettingsValue;
  /** The only way settings escape. */
  onConfirm: (value: ViewSettingsValue) => void;
  confirmLabel?: string;
  cancelLabel?: string;
  resetLabel?: string;
  sortTabLabel?: string;
  groupTabLabel?: string;
  filterTabLabel?: string;
  className?: string;
}

const EMPTY: ViewSettingsValue = {
  sortBy: null,
  sortDescending: false,
  groupBy: null,
  groupDescending: false,
  filters: {},
};

const countFilters = (filters: Record<string, string[]> | undefined) =>
  Object.values(filters ?? {}).reduce((n, ids) => n + ids.length, 0);

export const ViewSettingsDialog = ({
  open,
  onOpenChange,
  title = "View settings",
  description,
  sortItems,
  groupItems,
  filterGroups,
  value,
  onConfirm,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  resetLabel = "Reset",
  sortTabLabel = "Sort",
  groupTabLabel = "Group",
  filterTabLabel = "Filter",
  className,
}: ViewSettingsDialogProps) => {
  const [draft, setDraft] = React.useState<ViewSettingsValue>(EMPTY);

  // Held in a ref so the reset effect can depend on `open` alone: a caller
  // passing `value={{}}` inline hands us a new identity every render, which
  // would re-run the reset mid-interaction and wipe the user's work.
  const seedRef = React.useRef(value);
  React.useEffect(() => {
    seedRef.current = value;
  });

  React.useEffect(() => {
    if (!open) return;
    const seed = seedRef.current;
    setDraft({ ...EMPTY, ...seed, filters: { ...(seed?.filters ?? {}) } });
  }, [open]);

  const sections = [
    sortItems?.length ? "sort" : null,
    groupItems?.length ? "group" : null,
    filterGroups?.length ? "filter" : null,
  ].filter(Boolean) as string[];

  const patch = (next: Partial<ViewSettingsValue>) =>
    setDraft((prev) => ({ ...prev, ...next }));

  // Picking the selected field again clears it: a sort you cannot turn off is a
  // trap, and there is no other affordance for "no sort".
  const pickSort = (id: string) => patch({ sortBy: draft.sortBy === id ? null : id });
  const pickGroup = (id: string) => patch({ groupBy: draft.groupBy === id ? null : id });

  const toggleFilter = (groupId: string, itemId: string, multiple: boolean) =>
    setDraft((prev) => {
      const current = prev.filters?.[groupId] ?? [];
      const next = multiple
        ? current.includes(itemId)
          ? current.filter((x) => x !== itemId)
          : [...current, itemId]
        : current.includes(itemId)
          ? []
          : [itemId];
      return { ...prev, filters: { ...prev.filters, [groupId]: next } };
    });

  const commit = () => {
    onConfirm(draft);
    onOpenChange(false);
  };

  const descriptionId = React.useId();
  const activeFilters = countFilters(draft.filters);

  const sortPane = (
    <>
      <SelectListBody
        items={sortItems ?? []}
        selected={draft.sortBy ? [draft.sortBy] : []}
        onToggle={pickSort}
        onPick={pickSort}
        emptyText="No sort fields"
      />
      <DirectionToggle
        label="Descending"
        checked={Boolean(draft.sortDescending)}
        disabled={!draft.sortBy}
        onChange={(v) => patch({ sortDescending: v })}
      />
    </>
  );

  const groupPane = (
    <>
      <SelectListBody
        items={groupItems ?? []}
        selected={draft.groupBy ? [draft.groupBy] : []}
        onToggle={pickGroup}
        onPick={pickGroup}
        emptyText="No group fields"
      />
      <DirectionToggle
        label="Descending"
        checked={Boolean(draft.groupDescending)}
        disabled={!draft.groupBy}
        onChange={(v) => patch({ groupDescending: v })}
      />
    </>
  );

  const filterPane = (
    <div className="zen-flex zen-flex-col zen-gap-3">
      {(filterGroups ?? []).map((g) => (
        <div key={g.id}>
          <div className="zen-px-4 zen-pb-1 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">
            {g.label}
          </div>
          <SelectListBody
            items={g.items}
            multiple={g.multiple ?? true}
            selected={draft.filters?.[g.id] ?? []}
            onToggle={(id) => toggleFilter(g.id, id, g.multiple ?? true)}
            onPick={(id) => toggleFilter(g.id, id, g.multiple ?? true)}
            emptyText="No values"
          />
        </div>
      ))}
    </div>
  );

  const paneFor = (key: string) =>
    key === "sort" ? sortPane : key === "group" ? groupPane : filterPane;
  const labelFor = (key: string) =>
    key === "sort" ? sortTabLabel : key === "group" ? groupTabLabel : filterTabLabel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // The panes scroll on their own, so the dialog's padding and scroller
        // would double up.
        className={cn("zen-flex zen-max-h-[85vh] zen-flex-col zen-overflow-hidden zen-p-0", className)}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div className="zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4">
          <DialogTitle className="zen-pr-8">{title}</DialogTitle>
          {description ? (
            <DialogDescription id={descriptionId}>{description}</DialogDescription>
          ) : null}
        </div>

        {sections.length > 1 ? (
          <Tabs defaultValue={sections[0]} className="zen-flex zen-min-h-0 zen-flex-1 zen-flex-col">
            <TabsList className="zen-mx-6 zen-mt-3">
              {sections.map((key) => (
                <TabsTrigger key={key} value={key}>
                  {labelFor(key)}
                  {key === "filter" && activeFilters > 0 ? (
                    <span className="zen-ml-2 zen-rounded-zen-full zen-bg-zen-primary-soft zen-px-1.5 zen-text-xs zen-text-zen-primary-soft-fg">
                      {activeFilters}
                    </span>
                  ) : null}
                </TabsTrigger>
              ))}
            </TabsList>
            {sections.map((key) => (
              <TabsContent
                key={key}
                value={key}
                className="zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2"
              >
                {paneFor(key)}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2">
            {sections.length ? paneFor(sections[0]) : null}
          </div>
        )}

        <div className="zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3">
          <Button
            type="button"
            variant="ghost"
            color="neutral"
            size="sm"
            className="zen-mr-auto"
            onClick={() => setDraft({ ...EMPTY, filters: {} })}
          >
            {resetLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button type="button" size="sm" onClick={commit}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
ViewSettingsDialog.displayName = "ViewSettingsDialog";

/** Disabled until a field is chosen: a direction with nothing to order is noise. */
const DirectionToggle = ({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label
    className={cn(
      "zen-mt-2 zen-flex zen-items-center zen-gap-2 zen-border-0 zen-border-t zen-border-solid zen-border-zen-border zen-px-4 zen-pt-3 zen-text-sm",
      disabled && "zen-opacity-50",
    )}
  >
    <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
    {label}
  </label>
);
