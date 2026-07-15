import { createDroppable } from "@thisbeyond/solid-dnd";
import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { cn } from "../../lib/cn";
import type { ZoneType } from "./pivot-layout";
import { Icon } from "../icon/icon";

export interface PivotDropZoneProps {
  id: ZoneType;
  title: string;
  icon?: string;
  hideTitle?: boolean;
  class?: string;
  horizontal?: boolean;
  children?: JSX.Element;
  isEmpty?: boolean;
}

export function PivotDropZone(props: PivotDropZoneProps) {
  const droppable = createDroppable(props.id);
  
  return (
    <div
      ref={droppable.ref}
      class={cn(
        "zen-min-h-5 zen-min-w-5 zen-border zen-border-zen-border zen-bg-zen-muted/30 zen-p-2 zen-align-top zen-transition-colors",
        props.class,
        droppable.isActiveDroppable && "zen-border zen-border-zen-primary/40 zen-bg-zen-muted zen-border-dashed"
      )}
    >
      <Show when={!props.hideTitle}>
        <div class="zen-mb-1.5 zen-flex zen-items-center zen-justify-between">
          <div class="zen-flex zen-items-center zen-gap-2 zen-text-sm zen-font-semibold zen-text-zen-foreground zen-select-none">
            {props.icon && <Icon name={props.icon as any} class="zen-h-4 zen-w-4" />}
            {props.title}
          </div>
        </div>
      </Show>
      
      <div
        class={cn(
          "zen-flex zen-min-h-0 zen-min-w-0 zen-flex-1 zen-content-start zen-gap-1.5",
          props.horizontal ? "zen-flex-row zen-flex-wrap zen-items-center" : "zen-flex-col zen-items-stretch"
        )}
      >
        {props.children}
        <Show when={props.isEmpty}>
          <div class="zen-text-xs zen-text-zen-muted-foreground/50 zen-italic zen-py-0.5 zen-select-none zen-pointer-events-none">
            Drop fields here
          </div>
        </Show>
      </div>
    </div>
  );
}
