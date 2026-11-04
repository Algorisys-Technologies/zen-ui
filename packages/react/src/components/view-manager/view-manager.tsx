import * as React from "react";
import { flushSync } from "react-dom";
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
 *     views={views} activeId={active} state={screenState}
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
  className?: string;
};

const STANDARD = "__zen_standard_view__";

let seq = 0;
const newId = () => `view-${Date.now().toString(36)}-${(++seq).toString(36)}`;
const errorText = (e: unknown) => String((e as Error)?.message ?? e);

export function ViewManager<S>({
  views,
  activeId,
  state,
  standardState,
  standardName: standardNameProp,
  onSelect,
  onSave,
  onCreate,
  onRename,
  onDelete,
  onDefaultChange,
  onShare,
  "aria-label": ariaLabel,
  className,
}: ViewManagerProps<S>) {
  const loc = useLocale();
  const active = views.find((v) => v.id === activeId) ?? null;
  const standardName = standardNameProp ?? loc.t("viewManager.standard");
  const name = active?.name ?? standardName;
  const modified = React.useMemo(() => isViewModified(state, active, standardState), [state, active, standardState]);
  const standardIsDefault = !views.some((v) => v.isDefault);
  const isDefault = active ? !!active.isDefault : standardIsDefault;

  const [saveAsOpen, setSaveAsOpen] = React.useState(false);
  const [manageOpen, setManageOpen] = React.useState(false);
  const [status, setStatus] = React.useState("");
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  /** Cleared first and committed, so the same words said twice are announced twice. */
  const announce = (s: string) => {
    flushSync(() => setStatus(""));
    setStatus(s);
  };
  const save = async () => {
    const v = active;
    if (!v || v.readOnly || !onSave) return;
    try {
      await onSave({ ...v, state });
      announce(loc.t("viewManager.saved", { name: v.name }));
    } catch (e) {
      announce(loc.t("viewManager.saveFailed", { name: v.name, error: errorText(e) }));
    }
  };

  /** Save as: the state is this render's, so the view is what was on screen when Save was pressed. */
  const saveAs = async (viewName: string, asDefault: boolean) => {
    const view: SavedView<S> = { id: newId(), name: viewName.trim(), state };
    await onCreate!(view);
    if (asDefault) await onDefaultChange?.(view.id);
    announce(loc.t("viewManager.saved", { name: view.name }));
  };

  // A dialog opened from the menu has no trigger of its own to go back to (the
  // menu item it was opened from is gone), so closing it returns to the picker.
  const backToTrigger = (e: Event) => {
    e.preventDefault();
    triggerRef.current?.focus();
  };

  return (
    <div className={cn("zen-inline-flex zen-items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={triggerRef}
          aria-label={loc.t(modified ? "viewManager.triggerModified" : "viewManager.trigger", {
            label: ariaLabel ?? loc.t("viewManager.label"),
            name,
          })}
          className="zen-inline-flex zen-cursor-pointer zen-items-center zen-gap-1.5 zen-rounded-zen-md zen-border-0 zen-bg-transparent zen-px-1.5 zen-py-1 zen-text-zen-foreground hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
        >
          <span className="zen-text-lg zen-font-semibold" data-view-name="">{name}</span>
          {modified && (
            <span className="zen-rounded-zen-sm zen-bg-zen-muted zen-px-1.5 zen-py-0.5 zen-text-xs zen-font-medium zen-text-zen-muted-fg" data-view-modified="">
              {loc.t("viewManager.modified")}
            </span>
          )}
          <Icon name="chevron-down" size={16} className="zen-text-zen-muted-fg" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="zen-min-w-64">
          <DropdownMenuLabel>{loc.t("viewManager.views")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={activeId ?? STANDARD}
            onValueChange={(id) => {
              if (id === (activeId ?? STANDARD)) return;
              onSelect(id === STANDARD ? null : views.find((v) => v.id === id) ?? null);
            }}
          >
            <DropdownMenuRadioItem value={STANDARD} closeOnSelect>
              <ViewLabel name={standardName} isDefault={standardIsDefault} />
            </DropdownMenuRadioItem>
            {views.map((v) => (
              <DropdownMenuRadioItem key={v.id} value={v.id} closeOnSelect>
                <ViewLabel name={v.name} isDefault={!!v.isDefault} shared={!!v.shared} />
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          {onSave && (
            <DropdownMenuItem disabled={!active || !!active.readOnly || !modified} onSelect={() => void save()}>
              {loc.t("viewManager.save")}
            </DropdownMenuItem>
          )}
          {onCreate && (
            <DropdownMenuItem onSelect={() => setSaveAsOpen(true)}>{loc.t("viewManager.saveAs")}</DropdownMenuItem>
          )}
          {onDefaultChange && (
            <DropdownMenuItem disabled={isDefault} onSelect={() => void onDefaultChange(active?.id ?? null)}>
              {active ? loc.t("viewManager.openWithThis") : loc.t("viewManager.openWith", { name: standardName })}
            </DropdownMenuItem>
          )}
          {onShare && (
            <DropdownMenuItem
              onSelect={() => {
                const v = active ?? { id: STANDARD, name: standardName, state };
                onShare({ ...v, state }, encodeView({ name: v.name, state }));
                announce(loc.t("viewManager.linkCopied", { name: v.name }));
              }}
            >
              {loc.t("viewManager.copyLink")}
            </DropdownMenuItem>
          )}
          {(onRename || onDelete || onDefaultChange) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={views.length === 0} onSelect={() => setManageOpen(true)}>
                {loc.t("viewManager.manage")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="zen-sr-only" role="status">{status}</span>

      {/* Mounted only while open: Radix reports no onOpenChange for a dialog
          opened through `open`, so each opening starts from fresh state this way. */}
      <Dialog open={saveAsOpen} onOpenChange={setSaveAsOpen}>
        {saveAsOpen && (
          <SaveAsContent
            onClose={() => setSaveAsOpen(false)}
            onCloseAutoFocus={backToTrigger}
            views={views}
            suggested={freeViewName(active?.name ?? loc.t("viewManager.newView"), views)}
            canDefault={!!onDefaultChange}
            onSave={saveAs}
          />
        )}
      </Dialog>
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        {manageOpen && (
          <ManageContent
            onClose={() => setManageOpen(false)}
            onCloseAutoFocus={backToTrigger}
            views={views}
            standardName={standardName}
            onRename={onRename}
            onDelete={onDelete}
            onDefaultChange={onDefaultChange}
          />
        )}
      </Dialog>
    </div>
  );
}

const ViewLabel = (p: { name: string; isDefault: boolean; shared?: boolean }) => {
  const loc = useLocale();
  return (
    <span className="zen-flex zen-w-full zen-items-center zen-gap-2">
      <span className="zen-min-w-0 zen-flex-1 zen-truncate">{p.name}</span>
      {p.shared && <span className="zen-text-xs zen-text-zen-muted-fg">{loc.t("viewManager.shared")}</span>}
      {p.isDefault && <span className="zen-text-xs zen-text-zen-muted-fg">{loc.t("viewManager.default")}</span>}
    </span>
  );
};

/** Save as: a name (checked as you type once you have tried), and whether it opens by default. */
const SaveAsContent = (p: {
  onClose: () => void;
  onCloseAutoFocus: (e: Event) => void;
  views: SavedView[];
  suggested: string;
  canDefault: boolean;
  onSave: (name: string, asDefault: boolean) => Promise<void>;
}) => {
  const loc = useLocale();
  const id = React.useId();
  // Initialised once per opening: this component is mounted only while the dialog is open.
  const [name, setName] = React.useState(p.suggested);
  const [asDefault, setAsDefault] = React.useState(false);
  const [tried, setTried] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [failure, setFailure] = React.useState("");
  const problem = viewNameProblem(name, p.views);
  const submit = async () => {
    setTried(true);
    if (problem || pending) return;
    setPending(true);
    setFailure("");
    try {
      await p.onSave(name, asDefault);
      p.onClose();
    } catch (e) {
      setFailure(loc.t("viewManager.notSaved", { error: errorText(e) }));
      setPending(false);
    }
  };
  return (
    <DialogContent className="zen-max-w-md" onCloseAutoFocus={p.onCloseAutoFocus}>
      <DialogHeader>
        <DialogTitle>{loc.t("viewManager.saveAsTitle")}</DialogTitle>
        <DialogDescription>{loc.t("viewManager.saveAsDescription")}</DialogDescription>
      </DialogHeader>
      <form
        className="zen-flex zen-flex-col zen-gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="zen-flex zen-flex-col zen-gap-1.5">
          <label htmlFor={`${id}-name`} className="zen-text-sm zen-font-medium">{loc.t("viewManager.name")}</label>
          <Input
            id={`${id}-name`}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            aria-invalid={tried && problem ? "true" : undefined}
            aria-describedby={`${id}-problem`}
          />
          <p id={`${id}-problem`} className="zen-m-0 zen-min-h-5 zen-text-sm zen-text-zen-error" aria-live="polite">
            {(tried && problem) || failure}
          </p>
        </div>
        {p.canDefault && (
          <label className="zen-inline-flex zen-items-center zen-gap-2 zen-self-start">
            <Checkbox checked={asDefault} onCheckedChange={(c) => setAsDefault(c === true)} />
            <span className="zen-text-sm">{loc.t("viewManager.openByDefault")}</span>
          </label>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" color="neutral" onClick={p.onClose}>
            {loc.t("common.cancel")}
          </Button>
          <Button type="submit" loading={pending}>
            {loc.t("viewManager.save")}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

/** Rename, delete and pick the default, one row per view. Read-only views are listed but not editable. */
const ManageContent = (p: {
  onClose: () => void;
  onCloseAutoFocus: (e: Event) => void;
  views: SavedView[];
  standardName: string;
  onRename?: (id: string, name: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  onDefaultChange?: (id: string | null) => void | Promise<void>;
}) => {
  const loc = useLocale();
  const id = React.useId();
  const [problems, setProblems] = React.useState<Record<string, string>>({});
  /** The row whose Delete was pressed once: the second press deletes. */
  const [confirming, setConfirming] = React.useState<string | null>(null);
  const done = React.useRef<HTMLButtonElement>(null);
  // The views as they are NOW, not as this render's handlers closed over them:
  // Enter and the blur that follows must not rename twice.
  const latest = React.useRef(p.views);
  latest.current = p.views;
  const remove = async (viewId: string) => {
    setConfirming(null);
    await p.onDelete?.(viewId);
    done.current?.focus();
  };
  const rename = async (viewId: string, next: string, input: HTMLInputElement) => {
    const v = latest.current.find((x) => x.id === viewId);
    if (!v || next.trim() === v.name) return;
    const problem = viewNameProblem(next, latest.current, v.id);
    if (problem) {
      setProblems((x) => ({ ...x, [v.id]: problem }));
      return;
    }
    try {
      await p.onRename?.(v.id, next.trim());
      setProblems((x) => ({ ...x, [v.id]: "" }));
    } catch (e) {
      setProblems((x) => ({ ...x, [v.id]: loc.t("viewManager.notRenamed", { error: errorText(e) }) }));
      input.value = v.name;
    }
  };
  return (
    <DialogContent
      className="zen-max-w-lg"
      onCloseAutoFocus={p.onCloseAutoFocus}
      // Esc while a delete awaits its second press backs out of the delete only,
      // not out of the dialog. (Radix hears Esc on the document in the capture
      // phase, before the button would, so it is decided here.)
      onEscapeKeyDown={(e) => {
        if (confirming !== null) {
          e.preventDefault();
          setConfirming(null);
        }
      }}
    >
      <DialogHeader>
        <DialogTitle>{loc.t("viewManager.manageTitle")}</DialogTitle>
        <DialogDescription>{loc.t("viewManager.manageDescription")}</DialogDescription>
      </DialogHeader>
      <table className="zen-w-full zen-border-collapse zen-text-sm">
        <thead>
          <tr className="zen-text-xs zen-text-zen-muted-fg">
            <th className="zen-py-1.5 zen-text-start zen-font-medium">{loc.t("viewManager.name")}</th>
            {p.onDefaultChange && (
              <th className="zen-w-20 zen-py-1.5 zen-text-center zen-font-medium">{loc.t("viewManager.default")}</th>
            )}
            {p.onDelete && (
              <th className="zen-w-12 zen-py-1.5"><span className="zen-sr-only">{loc.t("common.delete")}</span></th>
            )}
          </tr>
        </thead>
        <tbody>
          {p.onDefaultChange && (
            <tr className="zen-border-0 zen-border-t zen-border-solid zen-border-zen-border">
              <td className="zen-py-1.5 zen-text-zen-muted-fg">{p.standardName}</td>
              <td className="zen-py-1.5 zen-text-center">
                <input
                  type="radio"
                  name={`${id}-default`}
                  aria-label={loc.t("viewManager.openWith", { name: p.standardName })}
                  checked={!p.views.some((v) => v.isDefault)}
                  onChange={() => void p.onDefaultChange?.(null)}
                />
              </td>
              {p.onDelete && <td />}
            </tr>
          )}
          {/* Rows keyed by id, and the name field uncontrolled: a rename builds a new view object. */}
          {p.views.map((v) => {
            const isConfirming = confirming === v.id;
            return (
              <tr key={v.id} className="zen-border-0 zen-border-t zen-border-solid zen-border-zen-border" data-view-row={v.id}>
                <td className="zen-py-1.5 zen-pe-3">
                  {!v.readOnly && p.onRename ? (
                    <>
                      <Input
                        defaultValue={v.name}
                        aria-label={loc.t("viewManager.nameOf", { name: v.name })}
                        aria-invalid={problems[v.id] ? "true" : undefined}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void rename(v.id, e.currentTarget.value, e.currentTarget);
                          }
                        }}
                        onBlur={(e) => void rename(v.id, e.currentTarget.value, e.currentTarget)}
                      />
                      {problems[v.id] && (
                        <p className="zen-m-0 zen-mt-1 zen-text-xs zen-text-zen-error" role="alert">{problems[v.id]}</p>
                      )}
                    </>
                  ) : (
                    <span>
                      {v.name}{" "}
                      <span className="zen-text-xs zen-text-zen-muted-fg">
                        {v.shared ? loc.t("viewManager.sharedWithYou") : loc.t("viewManager.readOnly")}
                      </span>
                    </span>
                  )}
                </td>
                {p.onDefaultChange && (
                  <td className="zen-py-1.5 zen-text-center">
                    <input
                      type="radio"
                      name={`${id}-default`}
                      aria-label={loc.t("viewManager.openWithQuoted", { name: v.name })}
                      checked={!!v.isDefault}
                      onChange={() => void p.onDefaultChange?.(v.id)}
                    />
                  </td>
                )}
                {p.onDelete && (
                  <td className="zen-py-1.5 zen-text-end">
                    {!v.readOnly && (
                      // One button that changes in place: swapping in a separate confirm
                      // button removes the focused element, the dialog's focus trap moves
                      // focus, and the blur cancels the confirmation it had just asked for.
                      <Button
                        variant={isConfirming ? "soft" : "ghost"}
                        color={isConfirming ? "error" : "neutral"}
                        shape={isConfirming ? undefined : "square"}
                        size="sm"
                        aria-label={
                          isConfirming
                            ? loc.t("viewManager.confirmDelete", { name: v.name })
                            : loc.t("viewManager.deleteView", { name: v.name })
                        }
                        title={isConfirming ? loc.t("viewManager.pressAgain") : loc.t("common.delete")}
                        onBlur={() => setConfirming(null)}
                        onClick={() => (isConfirming ? void remove(v.id) : setConfirming(v.id))}
                      >
                        {isConfirming ? loc.t("common.delete") : <Icon name="trash" size={16} />}
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      <DialogFooter>
        <Button ref={done} type="button" onClick={p.onClose}>{loc.t("common.done")}</Button>
      </DialogFooter>
    </DialogContent>
  );
};
