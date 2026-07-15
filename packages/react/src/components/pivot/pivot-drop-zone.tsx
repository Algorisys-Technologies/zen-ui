import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import type { PivotZone } from "@algorisys/zen-ui-core/pivot";
import { cn } from "../../lib/cn";
import { Icon, type IconName } from "../icon/icon";

/**
 * PivotDropZone — one of the four bins a field can live in.
 *
 * Mirrors the Solid binding's API exactly. The only difference is which drag
 * library provides the droppable: @dnd-kit here, @thisbeyond/solid-dnd there.
 * Everything a caller can see is the same.
 */

export interface PivotDropZoneProps {
  id: PivotZone;
  title: string;
  icon?: IconName;
  hideTitle?: boolean;
  className?: string;
  horizontal?: boolean;
  children?: React.ReactNode;
  isEmpty?: boolean;
}

export const PivotDropZone: React.FC<PivotDropZoneProps> = ({
  id,
  title,
  icon,
  hideTitle,
  className,
  horizontal,
  children,
  isEmpty,
}) => {
  // `data.zone` is what the drop handler reads. It must NOT parse the zone out
  // of the droppable's id: once a zone holds a chip, the chip is the droppable
  // that wins, and its id is a field key. That is the bug that deleted fields.
  const { setNodeRef, isOver } = useDroppable({ id, data: { zone: id } });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "zen-min-h-5 zen-min-w-5 zen-border zen-border-zen-border zen-bg-zen-muted/30 zen-p-2 zen-align-top zen-transition-colors",
        className,
        isOver && "zen-border zen-border-dashed zen-border-zen-primary/40 zen-bg-zen-muted",
      )}
    >
      {!hideTitle ? (
        <div className="zen-mb-1.5 zen-flex zen-items-center zen-justify-between">
          <div className="zen-flex zen-select-none zen-items-center zen-gap-2 zen-text-sm zen-font-semibold zen-text-zen-foreground">
            {icon ? <Icon name={icon} className="zen-h-4 zen-w-4" /> : null}
            {title}
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "zen-flex zen-min-h-0 zen-min-w-0 zen-flex-1 zen-content-start zen-gap-1.5",
          horizontal ? "zen-flex-row zen-flex-wrap zen-items-center" : "zen-flex-col zen-items-stretch",
        )}
      >
        {children}
        {isEmpty ? (
          <div className="zen-pointer-events-none zen-select-none zen-py-0.5 zen-text-xs zen-italic zen-text-zen-muted-fg/50">
            Drop fields here
          </div>
        ) : null}
      </div>
    </div>
  );
};
PivotDropZone.displayName = "PivotDropZone";
