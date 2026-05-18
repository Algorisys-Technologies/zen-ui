import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * Table — thin styled wrappers around the native <table> elements,
 * shadcn-style. Use directly for hand-rolled tables, or via <DataTable>
 * for the headless-table-on-TanStack composition.
 *
 * Styling is calibrated to the Zen theme table spec:
 *   - Header label: text-xs (Paragraph XSmall Medium), muted-fg
 *   - Cell padding: 8 px horizontal, 12 px vertical; min row height 48 px
 *   - Row default: border-b, zen-border
 *   - Row hover: subtle bg tint + sm shadow
 *   - Row selected: soft primary background + sm shadow
 */

/**
 * `containerClassName` / `containerStyle` let the caller control the scroll
 * wrapper (e.g. setting `maxHeight` so sticky table headers have something to
 * stick against). When unset the wrapper still applies `overflow-auto` so
 * wide tables get a horizontal scrollbar.
 */
export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, containerStyle, ...props }, ref) => (
    <div
      className={cn("relative w-full overflow-auto", containerClassName)}
      style={containerStyle}
    >
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm border-collapse", className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&_tr]:border-b [&_tr]:border-zen-border", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-zen-border bg-zen-muted/50 font-medium",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-zen-border",
      "transition-[background-color,box-shadow,outline-color] duration-100",
      // hover (Zen theme: subtle bg tint + sm drop shadow + slightly darker border tint)
      "hover:bg-zen-muted/50 hover:shadow-zen-sm",
      // selected (Zen theme: primary-soft bg + 1px primary inside outline + primary-tinted lg shadow)
      "data-[state=selected]:bg-zen-primary-soft",
      "data-[state=selected]:[box-shadow:0_4px_12px_0_var(--zen-color-primary-soft)]",
      "data-[state=selected]:outline data-[state=selected]:outline-1 data-[state=selected]:-outline-offset-1 data-[state=selected]:outline-zen-primary",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      // Zen theme header: 8px padding, Paragraph XSmall Medium, Neutral/200 (muted-fg)
      "h-10 px-2 py-2 text-left align-middle font-medium text-xs",
      "text-zen-muted-fg",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      // Zen theme cell: 8px horizontal, 12px vertical
      "px-2 py-3 align-middle text-sm text-zen-foreground",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-3 text-sm text-zen-muted-fg", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
