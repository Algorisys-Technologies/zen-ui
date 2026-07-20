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
      className={cn("zen-relative zen-w-full zen-overflow-auto", containerClassName)}
      style={containerStyle}
    >
      <table
        ref={ref}
        className={cn("zen-w-full zen-caption-bottom zen-text-sm zen-border-collapse", className)}
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
    className={cn("[&_tr]:zen-border-b [&_tr]:zen-border-zen-border", className)}
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
    className={cn("[&_tr:last-child]:zen-border-0", className)}
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
      "zen-border-t zen-border-zen-border zen-bg-zen-muted/50 zen-font-medium",
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
      "zen-border-b zen-border-zen-border",
      "zen-transition-[background-color,box-shadow,outline-color] zen-duration-100",
      // hover (Zen theme: subtle bg tint + sm drop shadow + slightly darker border tint)
      "hover:zen-bg-zen-muted/50 hover:zen-shadow-zen-sm",
      // selected (Zen theme: primary-soft bg + 1px primary inside outline + primary-tinted lg shadow)
      "data-[state=selected]:zen-bg-zen-primary-soft",
      "data-[state=selected]:zen-[box-shadow:0_4px_12px_0_var(--zen-color-primary-soft)]",
      "data-[state=selected]:zen-outline data-[state=selected]:zen-outline-1 data-[state=selected]:-zen-outline-offset-1 data-[state=selected]:zen-outline-zen-primary",
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
      "zen-h-10 zen-px-2 zen-py-2 zen-text-start zen-align-middle zen-font-medium zen-text-xs",
      "zen-text-zen-muted-fg",
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
      "zen-px-2 zen-py-3 zen-align-middle zen-text-sm zen-text-zen-foreground",
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
    className={cn("zen-mt-3 zen-text-sm zen-text-zen-muted-fg", className)}
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
