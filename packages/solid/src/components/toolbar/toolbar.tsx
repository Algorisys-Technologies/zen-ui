import { type JSX, For, Show, createEffect, createMemo, createSignal, onCleanup, onMount, on, splitProps, untrack } from "solid-js";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "../button/button";
import { Icon, type IconName } from "../icon/icon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../dropdown-menu/dropdown-menu";

/**
 * Toolbar — Solid binding. Mirrors packages/react/src/components/toolbar/:
 * same props, same class strings, same measurement strategy. See that file for
 * why `actions` is data rather than children.
 */

export interface ToolbarAction {
  id: string;
  label: JSX.Element;
  icon?: IconName;
  onSelect?: () => void;
  disabled?: boolean;
  variant?: ButtonProps["variant"];
  color?: ButtonProps["color"];
  /** `never` pins the action to the bar; anything else collapses when needed. */
  overflow?: "never" | "auto";
  /** Renders a divider before this action, in the bar and in the menu. */
  separatorBefore?: boolean;
}

export type ToolbarProps = JSX.HTMLAttributes<HTMLDivElement> & {
  actions: ToolbarAction[];
  overflowLabel?: string;
  size?: ButtonProps["size"];
};

export const Toolbar = (props: ToolbarProps) => {
  const [local, rest] = splitProps(props, [
    "actions",
    "overflowLabel",
    "size",
    "class",
    "children",
  ]);

  let containerRef: HTMLDivElement | undefined;
  let leadingRef: HTMLDivElement | undefined;
  let measureRef: HTMLDivElement | undefined;
  let overflowRef: HTMLDivElement | undefined;

  // Starts at "all" so the first paint is the common case (everything fits)
  // rather than an empty bar. `untrack` because this is a seed read, seen once
  // at setup — the effect below is what keeps it current.
  const [visibleCount, setVisibleCount] = createSignal(untrack(() => local.actions.length));

  const pinned = createMemo(() => local.actions.filter((a) => a.overflow === "never"));
  const collapsible = createMemo(() => local.actions.filter((a) => a.overflow !== "never"));

  const recompute = () => {
    if (!containerRef || !measureRef) return;
    // Widths come from a hidden row holding every action at full size.
    // Measuring the VISIBLE row would be circular: hiding an action changes the
    // row's width, which changes what fits, which changes what is hidden.
    const widths = Array.from(measureRef.children).map((el) => (el as HTMLElement).offsetWidth);
    const GAP = 8; // zen-gap-2
    const all = local.actions;
    const pinnedWidth = pinned().reduce((sum, a) => sum + (widths[all.indexOf(a)] ?? 0) + GAP, 0);
    const overflowWidth = (overflowRef?.offsetWidth ?? 36) + GAP;
    const leadingWidth = leadingRef?.offsetWidth ?? 0;

    let budget = containerRef.offsetWidth - leadingWidth - pinnedWidth;
    let fit = 0;
    const list = collapsible();
    for (const a of list) {
      const w = (widths[all.indexOf(a)] ?? 0) + GAP;
      const needsTrigger = fit < list.length - 1;
      if (budget - w < (needsTrigger ? overflowWidth : 0)) break;
      budget -= w;
      fit++;
    }
    setVisibleCount(fit);
  };

  onMount(() => {
    if (!containerRef || typeof ResizeObserver === "undefined") return;
    recompute();
    const ro = new ResizeObserver(() => recompute());
    ro.observe(containerRef);
    onCleanup(() => ro.disconnect());
  });

  // Recompute when the ACTIONS change, not only when the container resizes.
  // React's effect lists `actions` in its deps and so re-runs; onMount alone
  // does not, which would leave a stale visibleCount — too many buttons for the
  // new list, or a dead overflow menu. eslint-plugin-solid flagged exactly this,
  // which is a fair argument for having finally configured it.
  createEffect(on(() => local.actions, () => recompute()));

  const shown = createMemo(() => collapsible().slice(0, visibleCount()));
  const hidden = createMemo(() => collapsible().slice(visibleCount()));

  const renderButton = (a: ToolbarAction) => (
    <Button
      type="button"
      size={local.size ?? "sm"}
      variant={a.variant ?? "ghost"}
      color={a.color}
      disabled={a.disabled}
      onClick={() => a.onSelect?.()}
      iconLeft={a.icon ? <Icon name={a.icon} size={14} /> : undefined}
    >
      {a.label}
    </Button>
  );

  return (
    <div
      ref={containerRef}
      role="toolbar"
      class={cn(
        "zen-relative zen-flex zen-w-full zen-items-center zen-gap-2 zen-overflow-hidden",
        local.class,
      )}
      {...rest}
    >
      <Show when={local.children}>
        <div ref={leadingRef} class="zen-flex zen-min-w-0 zen-items-center zen-gap-2">
          {local.children}
        </div>
      </Show>

      <div class="zen-ml-auto zen-flex zen-items-center zen-gap-2">
        <For each={pinned()}>
          {(a) => (
            <>
              <Show when={a.separatorBefore}>
                <span class="zen-h-5 zen-w-px zen-shrink-0 zen-bg-zen-border" />
              </Show>
              {renderButton(a)}
            </>
          )}
        </For>
        <For each={shown()}>
          {(a) => (
            <>
              <Show when={a.separatorBefore}>
                <span class="zen-h-5 zen-w-px zen-shrink-0 zen-bg-zen-border" />
              </Show>
              {renderButton(a)}
            </>
          )}
        </For>

        <Show when={hidden().length > 0}>
          <div ref={overflowRef}>
            <DropdownMenu>
              <DropdownMenuTrigger
                as={Button}
                type="button"
                size={local.size ?? "sm"}
                variant="ghost"
                aria-label={local.overflowLabel ?? "More actions"}
              >
                <Icon name="more" size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <For each={hidden()}>
                  {(a) => (
                    <>
                      <Show when={a.separatorBefore}>
                        <DropdownMenuSeparator />
                      </Show>
                      <DropdownMenuItem disabled={a.disabled} onSelect={() => a.onSelect?.()}>
                        <Show when={a.icon}>
                          {(icon) => <Icon name={icon()} size={14} class="zen-mr-2" />}
                        </Show>
                        {a.label}
                      </DropdownMenuItem>
                    </>
                  )}
                </For>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Show>
      </div>

      {/*
        Hidden measurement row: every action at full width, out of flow so it
        cannot affect layout. `visibility: hidden` removes the subtree from the
        tab order (verified in a browser, not assumed); aria-hidden keeps it out
        of the accessibility tree.
      */}
      <div
        ref={measureRef}
        // Explicitly "true": bare `aria-hidden` renders as aria-hidden="" in
        // Solid, and an empty value is not `true` per ARIA — the row would stay
        // in the accessibility tree and announce 7 phantom buttons. React's JSX
        // resolves the bare form to "true", so this diverged silently.
        aria-hidden="true"
        class="zen-pointer-events-none zen-absolute zen-left-0 zen-top-0 zen-flex zen-gap-2 zen-opacity-0"
        style={{ visibility: "hidden" }}
      >
        <For each={local.actions}>{(a) => renderButton(a)}</For>
      </div>
    </div>
  );
};
