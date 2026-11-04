import { ViewManager, type ViewManagerProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-view-manager standard-name="All invoices" aria-label="Invoices view"></zen-view-manager>
 *
 *   vm.views = views;          // SavedView[]: JS property
 *   vm.state = screenState;    // the screen's state now: JS property
 *   vm.standardState = STANDARD;
 *   vm.addEventListener("zen-select", (e) => { apply(e.detail); vm.activeId = e.detail?.id ?? null; });
 *   vm.onSave = (view) => api.views.update(view);   // assigned: may return a Promise
 *
 * `views`, `state` and `standardState` are objects, so JS properties.
 * `activeId` is controlled, as in every binding: it is the `active-id`
 * attribute, and setting it to null removes the attribute, which is the
 * standard view (null and absent mean the same here, so it can be cleared).
 *
 * The callbacks are events, and like every element's they are opt-in: Save,
 * Save as, Copy link and Manage appear only when someone listens for (or
 * assigns) `zen-save`, `zen-create`, `zen-share`, `zen-rename` / `zen-delete`
 * / `zen-default-change`, exactly as they follow `onSave` & co. elsewhere.
 * A listener is told; it cannot make the dialog wait. To have Save as wait for
 * storage and show its error, ASSIGN the callback (`vm.onCreate = async (v) =>
 * …`): an assigned callback's return value reaches the factory. Two-argument
 * callbacks give an array as `detail` (`zen-rename`: [id, name]; `zen-share`:
 * [view, token]).
 *
 * `aria-label` is forwarded to the picker, not left on the transparent
 * (`display: contents`) host.
 */
type ViewManagerElementProps = Omit<ViewManagerProps, "onSelect" | "aria-label"> & {
  onSelect?: ViewManagerProps["onSelect"];
  ariaLabel?: string;
};

const toFactory = ({ ariaLabel, onSelect, ...props }: Partial<ViewManagerElementProps>): Partial<ViewManagerProps> => ({
  ...props,
  // Nobody listening for zen-select yet: picking a view is then reported to no one.
  onSelect: onSelect ?? (() => {}),
  "aria-label": ariaLabel,
});

defineZenElement<ViewManagerElementProps>({
  tag: "zen-view-manager",
  factory: (props) => {
    // Nothing to draw until `views` is set: throwing here is how an element
    // waits for its data (define.ts retries on the next property).
    if (!props.views) throw new Error("<zen-view-manager>: set `views` first");
    const vm = ViewManager(toFactory(props) as ViewManagerProps);
    return { ...vm, update: (next) => vm.update(toFactory(next)) };
  },
  attrs: {
    "active-id": "string",
    "standard-name": "string",
    "aria-label": "string",
  },
  props: ["views", "state", "standardState"],
  events: {
    onSelect: "zen-select",
    onSave: "zen-save",
    onCreate: "zen-create",
    onRename: "zen-rename",
    onDelete: "zen-delete",
    onDefaultChange: "zen-default-change",
    onShare: "zen-share",
  },
  childrenProp: false,
});
