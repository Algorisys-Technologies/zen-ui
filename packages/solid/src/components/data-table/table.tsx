import { type JSX, splitProps } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * Table — thin styled wrappers around the native <table> elements,
 * shadcn-style. Use directly for hand-rolled tables, or via <DataTable>
 * for the headless-table-on-TanStack composition.
 *
 * Styling is calibrated to the Zen theme table spec:
 *   - Header label: text-xs, muted-fg
 *   - Cell padding: 8px horizontal, 12px vertical; min row height 48px
 *   - Row default: border-b, zen-border
 *   - Row hover: subtle bg tint + sm shadow
 *   - Row selected: soft primary background + sm shadow
 */

export type TableProps = Omit<JSX.HTMLAttributes<HTMLTableElement>, "class"> & {
  containerClass?: string;
  containerStyle?: JSX.CSSProperties;
  class?: string;
};

export const Table = (props: TableProps) => {
  const [local, rest] = splitProps(props, ["class", "containerClass", "containerStyle"]);
  return (
    <div
      class={cn("relative w-full overflow-auto", local.containerClass)}
      style={local.containerStyle}
    >
      <table
        class={cn("w-full caption-bottom text-sm border-collapse", local.class)}
        {...rest}
      />
    </div>
  );
};

type SectionProps = Omit<JSX.HTMLAttributes<HTMLTableSectionElement>, "class"> & {
  class?: string;
};

export const TableHeader = (props: SectionProps) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <thead
      class={cn("[&_tr]:border-b [&_tr]:border-zen-border", local.class)}
      {...rest}
    />
  );
};

export const TableBody = (props: SectionProps) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <tbody class={cn("[&_tr:last-child]:border-0", local.class)} {...rest} />
  );
};

export const TableFooter = (props: SectionProps) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <tfoot
      class={cn(
        "border-t border-zen-border bg-zen-muted/50 font-medium",
        local.class,
      )}
      {...rest}
    />
  );
};

export const TableRow = (
  props: Omit<JSX.HTMLAttributes<HTMLTableRowElement>, "class"> & { class?: string },
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <tr
      class={cn(
        "border-b border-zen-border",
        "transition-[background-color,box-shadow,outline-color] duration-100",
        "hover:bg-zen-muted/50 hover:shadow-zen-sm",
        "data-[state=selected]:bg-zen-primary-soft",
        "data-[state=selected]:[box-shadow:0_4px_12px_0_var(--zen-color-primary-soft)]",
        "data-[state=selected]:outline data-[state=selected]:outline-1 data-[state=selected]:-outline-offset-1 data-[state=selected]:outline-zen-primary",
        local.class,
      )}
      {...rest}
    />
  );
};

export const TableHead = (
  props: Omit<JSX.ThHTMLAttributes<HTMLTableCellElement>, "class"> & { class?: string },
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <th
      class={cn(
        "h-10 px-2 py-2 text-left align-middle font-medium text-xs",
        "text-zen-muted-fg",
        local.class,
      )}
      {...rest}
    />
  );
};

export const TableCell = (
  props: Omit<JSX.TdHTMLAttributes<HTMLTableCellElement>, "class"> & { class?: string },
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <td
      class={cn("px-2 py-3 align-middle text-sm text-zen-foreground", local.class)}
      {...rest}
    />
  );
};

export const TableCaption = (
  props: Omit<JSX.HTMLAttributes<HTMLTableCaptionElement>, "class"> & { class?: string },
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <caption class={cn("mt-3 text-sm text-zen-muted-fg", local.class)} {...rest} />;
};
