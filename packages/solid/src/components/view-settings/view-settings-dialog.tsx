import { createSignal, createEffect, createUniqueId, untrack, For, Show } from "solid-js";
import { cn } from "../../lib/cn";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../dialog/dialog";
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
 *
 * Mirrors the React binding's API.
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
  class?: string;
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

export const ViewSettingsDialog = (props: ViewSettingsDialogProps) => {
  const [draft, setDraft] = createSignal<ViewSettingsValue>(EMPTY);
  const descriptionId = createUniqueId();

  // Tracks `props.open` only. The seed must be read untracked: a caller whose
  // `value` is a signal (the common case — it is what onConfirm writes back)
  // would otherwise make this effect depend on it, so any value change arriving
  // mid-edit re-seeds the draft and silently discards the user's pick.
  createEffect(() => {
    if (!props.open) return;
    const seed = untrack(() => props.value);
    setDraft({ ...EMPTY, ...seed, filters: { ...(seed?.filters ?? {}) } });
  });

  const sections = () =>
    [
      props.sortItems?.length ? "sort" : null,
      props.groupItems?.length ? "group" : null,
      props.filterGroups?.length ? "filter" : null,
    ].filter(Boolean) as string[];

  const patch = (next: Partial<ViewSettingsValue>) => setDraft((prev) => ({ ...prev, ...next }));

  // Picking the selected field again clears it: a sort you cannot turn off is a
  // trap, and there is no other affordance for "no sort".
  const pickSort = (id: string) => patch({ sortBy: draft().sortBy === id ? null : id });
  const pickGroup = (id: string) => patch({ groupBy: draft().groupBy === id ? null : id });

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
    props.onConfirm(draft());
    props.onOpenChange(false);
  };

  const activeFilters = () => countFilters(draft().filters);
  const labelFor = (key: string) =>
    key === "sort"
      ? (props.sortTabLabel ?? "Sort")
      : key === "group"
        ? (props.groupTabLabel ?? "Group")
        : (props.filterTabLabel ?? "Filter");

  const Pane = (p: { section: string }) => (
    <Show
      when={p.section !== "filter"}
      fallback={
        <div class="zen-flex zen-flex-col zen-gap-3">
          <For each={props.filterGroups ?? []}>
            {(g) => (
              <div>
                <div class="zen-px-4 zen-pb-1 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">
                  {g.label}
                </div>
                <SelectListBody
                  items={g.items}
                  multiple={g.multiple ?? true}
                  selected={draft().filters?.[g.id] ?? []}
                  onToggle={(id) => toggleFilter(g.id, id, g.multiple ?? true)}
                  onPick={(id) => toggleFilter(g.id, id, g.multiple ?? true)}
                  emptyText="No values"
                />
              </div>
            )}
          </For>
        </div>
      }
    >
      <Show
        when={p.section === "sort"}
        fallback={
          <>
            <SelectListBody
              items={props.groupItems ?? []}
              selected={draft().groupBy ? [draft().groupBy as string] : []}
              onToggle={pickGroup}
              onPick={pickGroup}
              emptyText="No group fields"
            />
            <DirectionToggle
              label="Descending"
              checked={Boolean(draft().groupDescending)}
              disabled={!draft().groupBy}
              onChange={(v) => patch({ groupDescending: v })}
            />
          </>
        }
      >
        <SelectListBody
          items={props.sortItems ?? []}
          selected={draft().sortBy ? [draft().sortBy as string] : []}
          onToggle={pickSort}
          onPick={pickSort}
          emptyText="No sort fields"
        />
        <DirectionToggle
          label="Descending"
          checked={Boolean(draft().sortDescending)}
          disabled={!draft().sortBy}
          onChange={(v) => patch({ sortDescending: v })}
        />
      </Show>
    </Show>
  );

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        // The panes scroll on their own, so the dialog's padding and scroller
        // would double up.
        class={cn(
          "zen-flex zen-max-h-[85vh] zen-flex-col zen-overflow-hidden zen-p-0",
          props.class,
        )}
        aria-describedby={props.description ? descriptionId : undefined}
      >
        <div class="zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4">
          <DialogTitle class="zen-pr-8">{props.title ?? "View settings"}</DialogTitle>
          <Show when={props.description}>
            <DialogDescription id={descriptionId}>{props.description}</DialogDescription>
          </Show>
        </div>

        <Show
          when={sections().length > 1}
          fallback={
            <div class="zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2">
              <Show when={sections().length}>
                <Pane section={sections()[0]} />
              </Show>
            </div>
          }
        >
          <Tabs defaultValue={sections()[0]} class="zen-flex zen-min-h-0 zen-flex-1 zen-flex-col">
            <TabsList class="zen-mx-6 zen-mt-3">
              <For each={sections()}>
                {(key) => (
                  <TabsTrigger value={key}>
                    {labelFor(key)}
                    <Show when={key === "filter" && activeFilters() > 0}>
                      <span class="zen-ml-2 zen-rounded-zen-full zen-bg-zen-primary-soft zen-px-1.5 zen-text-xs zen-text-zen-primary-soft-fg">
                        {activeFilters()}
                      </span>
                    </Show>
                  </TabsTrigger>
                )}
              </For>
            </TabsList>
            <For each={sections()}>
              {(key) => (
                <TabsContent
                  value={key}
                  class="zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2"
                >
                  <Pane section={key} />
                </TabsContent>
              )}
            </For>
          </Tabs>
        </Show>

        <div class="zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3">
          <Button
            type="button"
            variant="ghost"
            color="neutral"
            size="sm"
            class="zen-mr-auto"
            onClick={() => setDraft({ ...EMPTY, filters: {} })}
          >
            {props.resetLabel ?? "Reset"}
          </Button>
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => props.onOpenChange(false)}
          >
            {props.cancelLabel ?? "Cancel"}
          </Button>
          <Button type="button" size="sm" onClick={commit}>
            {props.confirmLabel ?? "OK"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/** Disabled until a field is chosen: a direction with nothing to order is noise. */
const DirectionToggle = (props: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label
    class={cn(
      "zen-mt-2 zen-flex zen-items-center zen-gap-2 zen-border-0 zen-border-t zen-border-solid zen-border-zen-border zen-px-4 zen-pt-3 zen-text-sm",
      props.disabled && "zen-opacity-50",
    )}
  >
    <Switch checked={props.checked} disabled={props.disabled} onChange={(v) => props.onChange(v)} />
    {props.label}
  </label>
);
