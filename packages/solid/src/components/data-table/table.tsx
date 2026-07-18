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
      class={cn("zen-relative zen-w-full zen-overflow-auto", local.containerClass)}
      style={local.containerStyle}
    >
      <table
        class={cn("zen-w-full zen-caption-bottom zen-text-sm zen-border-collapse", local.class)}
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
      class={cn("[&_tr]:zen-border-b [&_tr]:zen-border-zen-border", local.class)}
      {...rest}
    />
  );
};

export const TableBody = (props: SectionProps) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <tbody class={cn("[&_tr:last-child]:zen-border-0", local.class)} {...rest} />
  );
};

export const TableFooter = (props: SectionProps) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <tfoot
      class={cn(
        "zen-border-t zen-border-zen-border zen-bg-zen-muted/50 zen-font-medium",
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
        "zen-border-b zen-border-zen-border",
        "zen-transition-[background-color,box-shadow,outline-color] zen-duration-100",
        "hover:zen-bg-zen-muted/50 hover:zen-shadow-zen-sm",
        "data-[state=selected]:zen-bg-zen-primary-soft",
        "data-[state=selected]:zen-[box-shadow:0_4px_12px_0_var(--zen-color-primary-soft)]",
        "data-[state=selected]:zen-outline data-[state=selected]:zen-outline-1 data-[state=selected]:-zen-outline-offset-1 data-[state=selected]:zen-outline-zen-primary",
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
        "zen-h-10 zen-px-2 zen-py-2 zen-text-left zen-align-middle zen-font-medium zen-text-xs",
        "zen-text-zen-muted-fg",
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
      class={cn("zen-px-2 zen-py-3 zen-align-middle zen-text-sm zen-text-zen-foreground", local.class)}
      {...rest}
    />
  );
};

export const TableCaption = (
  props: Omit<JSX.HTMLAttributes<HTMLTableCaptionElement>, "class"> & { class?: string },
) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <caption class={cn("zen-mt-3 zen-text-sm zen-text-zen-muted-fg", local.class)} {...rest} />;
};
