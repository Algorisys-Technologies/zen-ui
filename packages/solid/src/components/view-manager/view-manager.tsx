import { For, Show, createEffect, createMemo, createSignal, createUniqueId, on, splitProps } from "solid-js";
import {
  encodeView,
  freeViewName,
  isViewModified,
  viewNameProblem,
  type SavedView,
} from "@algorisys/zen-ui-core/views";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Input } from "../form/input/input";
import { Checkbox } from "../form/checkbox/checkbox";
import { Icon } from "../icon/icon";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../dialog/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import { useLocale } from "../locale/locale";

export type { SavedView };

/**
 * ViewManager — named list setups a person keeps and returns to ("My overdue
 * invoices, this quarter, these columns"), as a picker beside the page title.
 *
 *   <ViewManager
 *     views={views()} activeId={active()} state={screenState()}
 *     onSelect={(v) => apply(v?.state ?? standard)}
 *     onSave={save} onCreate={create} onRename={rename} onDelete={remove}
 *     onDefaultChange={setDefault} onShare={(v, token) => copy(`${url}?view=${token}`)}
 *   />
 *
 * The state is one serialisable object of the app's choosing (a FilterBuilder
 * value, sort, grouping, columns); this picker never looks inside it. It says
 * when the screen has drifted from the view (key order is not a change), and
 * storage is the app's: every change arrives as a callback, which may return a
 * Promise. A dialog waits for it, and shows the error if it fails rather than
 * closing on a save that did not happen. A view marked readOnly (shared by
 * someone else, or the app's own) can be used and copied, not saved over,
 * renamed or deleted. The pure half is @algorisys/zen-ui-core/views
 * (check:views), which also reads share links back (decodeView).
 */
export type ViewManagerProps<S> = {
  views: SavedView<S>[];
  /** The view on screen; null for the standard (unsaved) one. */
  activeId: string | null;
  /** The screen's state now, to tell when it has drifted from the view. */
  state: S;
  /** The state with no view applied: with it, "Standard" shows Modified too. */
  standardState?: S;
  /** Default "Standard". */
  standardName?: string;
  /** A view was chosen (null: the standard one). Apply its state. */
  onSelect: (view: SavedView<S> | null) => void;
  /** Save: the active view, with the current state. Without it, no Save. */
  onSave?: (view: SavedView<S>) => void | Promise<void>;
  /** Save as: a new view of the current state. Without it, no Save as. */
  onCreate?: (view: SavedView<S>) => void | Promise<void>;
  onRename?: (id: string, name: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  /** The view the screen opens with changed (null: the standard one). */
  onDefaultChange?: (id: string | null) => void | Promise<void>;
  /** Copy link: the view with the current state as a URL-safe token. Without it, no Copy link. */
  onShare?: (view: SavedView<S>, token: string) => void;
  /** Names the trigger for assistive tech, before the view name. Default "View". */
  "aria-label"?: string;
  class?: string;
};

const STANDARD = "__zen_standard_view__";

let seq = 0;
const newId = () => `view-${Date.now().toString(36)}-${(++seq).toString(36)}`;

export function ViewManager<S>(props: ViewManagerProps<S>) {
  const loc = useLocale();
  const [local] = splitProps(props, [
    "views", "activeId", "state", "standardState", "standardName", "onSelect", "onSave", "onCreate", "onRename",
    "onDelete", "onDefaultChange", "onShare", "aria-label", "class",
  ]);
  const active = createMemo(() => local.views.find((v) => v.id === local.activeId) ?? null);
  const standardName = () => local.standardName ?? loc.t("viewManager.standard");
  const name = () => active()?.name ?? standardName();
  const modified = createMemo(() => isViewModified(local.state, active(), local.standardState));
  const isDefault = () => (active() ? !!active()!.isDefault : !local.views.some((v) => v.isDefault));

  const [saveAsOpen, setSaveAsOpen] = createSignal(false);
  const [manageOpen, setManageOpen] = createSignal(false);
  const [status, setStatus] = createSignal("");

  const announce = (s: string) => {
    setStatus("");
    queueMicrotask(() => setStatus(s));
  };
  const save = async () => {
    const v = active();
    if (!v || v.readOnly || !local.onSave) return;
    try {
      await local.onSave({ ...v, state: local.state });
      announce(loc.t("viewManager.saved", { name: v.name }));
    } catch (e) {
      announce(loc.t("viewManager.saveFailed", { name: v.name, error: String((e as Error)?.message ?? e) }));
    }
  };

  /** Save as: the state is read before the first await, so the view is what was on screen when Save was pressed. */
  const saveAs = async (viewName: string, asDefault: boolean) => {
    const view: SavedView<S> = { id: newId(), name: viewName.trim(), state: local.state };
    await local.onCreate!(view);
    if (asDefault) await local.onDefaultChange?.(view.id);
    announce(loc.t("viewManager.saved", { name: view.name }));
  };

  return (
    <div class={cn("zen-inline-flex zen-items-center", local.class)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={loc.t(modified() ? "viewManager.triggerModified" : "viewManager.trigger", { label: local["aria-label"] ?? loc.t("viewManager.label"), name: name() })}
          class="zen-inline-flex zen-cursor-pointer zen-items-center zen-gap-1.5 zen-rounded-zen-md zen-border-0 zen-bg-transparent zen-px-1.5 zen-py-1 zen-text-zen-foreground hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
        >
          <span class="zen-text-lg zen-font-semibold" data-view-name="">{name()}</span>
          <Show when={modified()}>
            <span class="zen-rounded-zen-sm zen-bg-zen-muted zen-px-1.5 zen-py-0.5 zen-text-xs zen-font-medium zen-text-zen-muted-fg" data-view-modified="">
              {loc.t("viewManager.modified")}
            </span>
          </Show>
          <Icon name="chevron-down" size={16} class="zen-text-zen-muted-fg" />
        </DropdownMenuTrigger>
        <DropdownMenuContent class="zen-min-w-64">
          <DropdownMenuLabel>{loc.t("viewManager.views")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={local.activeId ?? STANDARD}
            onChange={(id: string) => {
              if (id === (local.activeId ?? STANDARD)) return;
              local.onSelect(id === STANDARD ? null : local.views.find((v) => v.id === id) ?? null);
            }}
          >
            <DropdownMenuRadioItem value={STANDARD} closeOnSelect>
              <ViewLabel name={standardName()} isDefault={!local.views.some((v) => v.isDefault)} />
            </DropdownMenuRadioItem>
            <For each={local.views}>
              {(v) => (
                <DropdownMenuRadioItem value={v.id} closeOnSelect>
                  <ViewLabel name={v.name} isDefault={!!v.isDefault} shared={!!v.shared} readOnly={!!v.readOnly} />
                </DropdownMenuRadioItem>
              )}
            </For>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <Show when={local.onSave}>
            <DropdownMenuItem disabled={!active() || !!active()?.readOnly || !modified()} onSelect={() => void save()}>
              {loc.t("viewManager.save")}
            </DropdownMenuItem>
          </Show>
          <Show when={local.onCreate}>
            <DropdownMenuItem onSelect={() => setSaveAsOpen(true)}>{loc.t("viewManager.saveAs")}</DropdownMenuItem>
          </Show>
          <Show when={local.onDefaultChange}>
            <DropdownMenuItem
              disabled={isDefault()}
              onSelect={() => void local.onDefaultChange?.(active()?.id ?? null)}
            >
              {active() ? loc.t("viewManager.openWithThis") : loc.t("viewManager.openWith", { name: standardName() })}
            </DropdownMenuItem>
          </Show>
          <Show when={local.onShare}>
            <DropdownMenuItem
              onSelect={() => {
                const v = active() ?? { id: STANDARD, name: standardName(), state: local.state };
                local.onShare!({ ...v, state: local.state }, encodeView({ name: v.name, state: local.state }));
                announce(loc.t("viewManager.linkCopied", { name: v.name }));
              }}
            >
              {loc.t("viewManager.copyLink")}
            </DropdownMenuItem>
          </Show>
          <Show when={local.onRename || local.onDelete || local.onDefaultChange}>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={local.views.length === 0} onSelect={() => setManageOpen(true)}>
              {loc.t("viewManager.manage")}
            </DropdownMenuItem>
          </Show>
        </DropdownMenuContent>
      </DropdownMenu>
      <span class="zen-sr-only" role="status">{status()}</span>

      <SaveAsDialog
        open={saveAsOpen()}
        onOpenChange={setSaveAsOpen}
        views={local.views}
        suggested={freeViewName(active()?.name ?? loc.t("viewManager.newView"), local.views)}
        canDefault={!!local.onDefaultChange}
        onSave={saveAs}
      />
      <ManageDialog
        open={manageOpen()}
        onOpenChange={setManageOpen}
        views={local.views}
        standardName={standardName()}
        onRename={local.onRename}
        onDelete={local.onDelete}
        onDefaultChange={local.onDefaultChange}
      />
    </div>
  );
}

const ViewLabel = (p: { name: string; isDefault: boolean; shared?: boolean; readOnly?: boolean }) => {
  const loc = useLocale();
  return (
    <span class="zen-flex zen-w-full zen-items-center zen-gap-2">
      <span class="zen-min-w-0 zen-flex-1 zen-truncate">{p.name}</span>
      <Show when={p.shared}>
        <span class="zen-text-xs zen-text-zen-muted-fg">{loc.t("viewManager.shared")}</span>
      </Show>
      <Show when={p.isDefault}>
        <span class="zen-text-xs zen-text-zen-muted-fg">{loc.t("viewManager.default")}</span>
      </Show>
    </span>
  );
};

/** Save as: a name (checked as you type once you have tried), and whether it opens by default. */
const SaveAsDialog = (p: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  views: SavedView[];
  suggested: string;
  canDefault: boolean;
  onSave: (name: string, asDefault: boolean) => Promise<void>;
}) => {
  const loc = useLocale();
  const id = createUniqueId();
  const [name, setName] = createSignal("");
  const [asDefault, setAsDefault] = createSignal(false);
  const [tried, setTried] = createSignal(false);
  const [pending, setPending] = createSignal(false);
  const [failure, setFailure] = createSignal("");
  const problem = () => viewNameProblem(name(), p.views);
  // Fresh each time it opens. (Not in onOpenChange: the dialog is opened from
  // the menu through `open`, and Kobalte reports only the changes it makes.)
  createEffect(
    on(
      () => p.open,
      (open) => {
        if (!open) return;
        setName(p.suggested);
        setAsDefault(false);
        setTried(false);
        setFailure("");
      },
    ),
  );
  const submit = async () => {
    setTried(true);
    if (problem() || pending()) return;
    setPending(true);
    setFailure("");
    try {
      await p.onSave(name(), asDefault());
      p.onOpenChange(false);
    } catch (e) {
      setFailure(loc.t("viewManager.notSaved", { error: String((e as Error)?.message ?? e) }));
    } finally {
      setPending(false);
    }
  };
  return (
    <Dialog open={p.open} onOpenChange={p.onOpenChange}>
      <DialogContent class="zen-max-w-md">
        <DialogHeader>
          <DialogTitle>{loc.t("viewManager.saveAsTitle")}</DialogTitle>
          <DialogDescription>{loc.t("viewManager.saveAsDescription")}</DialogDescription>
        </DialogHeader>
        <form
          class="zen-flex zen-flex-col zen-gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div class="zen-flex zen-flex-col zen-gap-1.5">
            <label for={`${id}-name`} class="zen-text-sm zen-font-medium">{loc.t("viewManager.name")}</label>
            <Input
              id={`${id}-name`}
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              aria-invalid={tried() && problem() ? "true" : undefined}
              aria-describedby={`${id}-problem`}
              autofocus
            />
            <p id={`${id}-problem`} class="zen-m-0 zen-min-h-5 zen-text-sm zen-text-zen-error" aria-live="polite">
              {(tried() && problem()) || failure()}
            </p>
          </div>
          <Show when={p.canDefault}>
            <Checkbox checked={asDefault()} onChange={setAsDefault} label={loc.t("viewManager.openByDefault")} />
          </Show>
          <DialogFooter>
            <Button type="button" variant="outline" color="neutral" onClick={() => p.onOpenChange(false)}>
              {loc.t("common.cancel")}
            </Button>
            <Button type="submit" loading={pending()}>
              {loc.t("viewManager.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/** Rename, delete and pick the default, one row per view. Read-only views are listed but not editable. */
const ManageDialog = (p: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  views: SavedView[];
  standardName: string;
  onRename?: (id: string, name: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  onDefaultChange?: (id: string | null) => void | Promise<void>;
}) => {
  const loc = useLocale();
  const id = createUniqueId();
  const [problems, setProblems] = createSignal<Record<string, string>>({});
  /** The row whose Delete was pressed once: the second press deletes. */
  const [confirming, setConfirming] = createSignal<string | null>(null);
  let done: HTMLButtonElement | undefined;
  const viewOf = (viewId: string) => p.views.find((v) => v.id === viewId);
  const remove = async (viewId: string) => {
    setConfirming(null);
    await p.onDelete?.(viewId);
    done?.focus();
  };
  const rename = async (viewId: string, next: string, input: HTMLInputElement) => {
    const v = viewOf(viewId);
    // Compared with the view as it is NOW: Enter and the blur that follows must not rename twice.
    if (!v || next.trim() === v.name) return;
    const problem = viewNameProblem(next, p.views, v.id);
    if (problem) {
      setProblems((x) => ({ ...x, [v.id]: problem }));
      return;
    }
    try {
      await p.onRename?.(v.id, next.trim());
      setProblems((x) => ({ ...x, [v.id]: "" }));
    } catch (e) {
      setProblems((x) => ({ ...x, [v.id]: loc.t("viewManager.notRenamed", { error: String((e as Error)?.message ?? e) }) }));
      input.value = v.name;
    }
  };
  return (
    <Dialog open={p.open} onOpenChange={p.onOpenChange}>
      <DialogContent class="zen-max-w-lg">
        <DialogHeader>
          <DialogTitle>{loc.t("viewManager.manageTitle")}</DialogTitle>
          <DialogDescription>{loc.t("viewManager.manageDescription")}</DialogDescription>
        </DialogHeader>
        <table class="zen-w-full zen-border-collapse zen-text-sm">
          <thead>
            <tr class="zen-text-xs zen-text-zen-muted-fg">
              <th class="zen-py-1.5 zen-text-start zen-font-medium">{loc.t("viewManager.name")}</th>
              <Show when={p.onDefaultChange}>
                <th class="zen-w-20 zen-py-1.5 zen-text-center zen-font-medium">{loc.t("viewManager.default")}</th>
              </Show>
              <Show when={p.onDelete}>
                <th class="zen-w-12 zen-py-1.5"><span class="zen-sr-only">{loc.t("common.delete")}</span></th>
              </Show>
            </tr>
          </thead>
          <tbody>
            <Show when={p.onDefaultChange}>
              <tr class="zen-border-0 zen-border-t zen-border-solid zen-border-zen-border">
                <td class="zen-py-1.5 zen-text-zen-muted-fg">{p.standardName}</td>
                <td class="zen-py-1.5 zen-text-center">
                  <input
                    type="radio"
                    name={`${id}-default`}
                    aria-label={loc.t("viewManager.openWith", { name: p.standardName })}
                    checked={!p.views.some((v) => v.isDefault)}
                    onChange={() => void p.onDefaultChange?.(null)}
                  />
                </td>
                <Show when={p.onDelete}><td /></Show>
              </tr>
            </Show>
            {/* Rows keyed by id: a rename builds a new view object, and an object-keyed row would remount mid-edit. */}
            <For each={p.views.map((v) => v.id)}>
              {(viewId) => {
                const v = () => viewOf(viewId) ?? ({ id: viewId, name: "", state: null } as SavedView);
                return (
                <tr class="zen-border-0 zen-border-t zen-border-solid zen-border-zen-border" data-view-row={v().id}>
                  <td class="zen-py-1.5 zen-pe-3">
                    <Show
                      when={!v().readOnly && p.onRename}
                      fallback={
                        <span>
                          {v().name} <span class="zen-text-xs zen-text-zen-muted-fg">{v().shared ? loc.t("viewManager.sharedWithYou") : loc.t("viewManager.readOnly")}</span>
                        </span>
                      }
                    >
                      <Input
                        value={v().name}
                        aria-label={loc.t("viewManager.nameOf", { name: v().name })}
                        aria-invalid={problems()[v().id] ? "true" : undefined}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void rename(viewId, e.currentTarget.value, e.currentTarget);
                          }
                        }}
                        onBlur={(e) => void rename(viewId, e.currentTarget.value, e.currentTarget)}
                      />
                      <Show when={problems()[v().id]}>
                        <p class="zen-m-0 zen-mt-1 zen-text-xs zen-text-zen-error" role="alert">{problems()[v().id]}</p>
                      </Show>
                    </Show>
                  </td>
                  <Show when={p.onDefaultChange}>
                    <td class="zen-py-1.5 zen-text-center">
                      <input
                        type="radio"
                        name={`${id}-default`}
                        aria-label={loc.t("viewManager.openWithQuoted", { name: v().name })}
                        checked={!!v().isDefault}
                        onChange={() => void p.onDefaultChange?.(v().id)}
                      />
                    </td>
                  </Show>
                  <Show when={p.onDelete}>
                    <td class="zen-py-1.5 zen-text-end">
                      <Show when={!v().readOnly}>
                        {/* One button that changes in place: swapping in a separate confirm button
                            removed the focused element, the dialog's focus trap moved focus, and the
                            blur cancelled the confirmation it had just asked for. */}
                        <Button
                          variant={confirming() === viewId ? "soft" : "ghost"}
                          color={confirming() === viewId ? "error" : "neutral"}
                          shape={confirming() === viewId ? undefined : "square"}
                          size="sm"
                          aria-label={confirming() === viewId ? loc.t("viewManager.confirmDelete", { name: v().name }) : loc.t("viewManager.deleteView", { name: v().name })}
                          title={confirming() === viewId ? loc.t("viewManager.pressAgain") : loc.t("common.delete")}
                          onBlur={() => setConfirming(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape" && confirming() === viewId) {
                              // Backs out of the delete only, not out of the dialog.
                              e.preventDefault();
                              e.stopPropagation();
                              setConfirming(null);
                            }
                          }}
                          onClick={() => (confirming() === viewId ? void remove(viewId) : setConfirming(viewId))}
                        >
                          <Show when={confirming() === viewId} fallback={<Icon name="trash" size={16} />}>
                            {loc.t("common.delete")}
                          </Show>
                        </Button>
                      </Show>
                    </td>
                  </Show>
                </tr>
                );
              }}
            </For>
          </tbody>
        </table>
        <DialogFooter>
          <Button ref={done} type="button" onClick={() => p.onOpenChange(false)}>{loc.t("common.done")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
