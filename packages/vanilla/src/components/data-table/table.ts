import { cn } from "../../lib/cn";
import { toNodes, type BaseProps, type ZenComponent } from "../../lib/component";
import { styled } from "../../lib/styled";

/**
 * Table — thin styled wrappers around the native <table> elements, shadcn-style.
 * Use directly for hand-rolled tables, or via <DataTable> for the headless
 * data-grid composition. Ported verbatim from React's `table.tsx`; the class
 * strings are identical so the two bindings render the same table.
 *
 * `Table` is written out (rather than via `styled`) because it wraps the <table>
 * in a scroll container and interprets `containerClass` / `containerStyle`, which
 * the `styled` shape does not model.
 */

export interface TableProps extends BaseProps {
  /** Class for the scroll wrapper (e.g. a `maxHeight` for sticky headers). */
  containerClass?: string;
  containerStyle?: Partial<CSSStyleDeclaration>;
}

export function Table(props: TableProps = {}): ZenComponent<TableProps> {
  let current: TableProps = { ...props };
  const wrapper = document.createElement("div");
  const table = document.createElement("table");
  wrapper.append(table);

  const render = () => {
    wrapper.className = cn(
      "zen-relative zen-w-full zen-overflow-auto",
      current.containerClass,
    );
    if (current.containerStyle) {
      Object.assign(wrapper.style, current.containerStyle);
    }
    table.className = cn(
      "zen-w-full zen-caption-bottom zen-text-sm zen-border-collapse",
      current.class,
    );
    table.replaceChildren(...toNodes(current.children));
  };
  render();

  return {
    el: wrapper,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      wrapper.remove();
    },
  };
}

export const TableHeader = styled<BaseProps>({
  tag: "thead",
  className: "[&_tr]:zen-border-b [&_tr]:zen-border-zen-border",
});

export const TableBody = styled<BaseProps>({
  tag: "tbody",
  className: "[&_tr:last-child]:zen-border-0",
});

export const TableFooter = styled<BaseProps>({
  tag: "tfoot",
  className:
    "zen-border-t zen-border-zen-border zen-bg-zen-muted/50 zen-font-medium",
});

export const TableRow = styled<BaseProps>({
  tag: "tr",
  className: cn(
    "zen-border-b zen-border-zen-border",
    "zen-transition-[background-color,box-shadow,outline-color] zen-duration-100",
    "hover:zen-bg-zen-muted/50 hover:zen-shadow-zen-sm",
    "data-[state=selected]:zen-bg-zen-primary-soft",
    "data-[state=selected]:zen-[box-shadow:0_4px_12px_0_var(--zen-color-primary-soft)]",
    "data-[state=selected]:zen-outline data-[state=selected]:zen-outline-1 data-[state=selected]:-zen-outline-offset-1 data-[state=selected]:zen-outline-zen-primary",
  ),
});

export const TableHead = styled<BaseProps>({
  tag: "th",
  className: cn(
    "zen-h-10 zen-px-2 zen-py-2 zen-text-left zen-align-middle zen-font-medium zen-text-xs",
    "zen-text-zen-muted-fg",
  ),
});

export const TableCell = styled<BaseProps>({
  tag: "td",
  className: "zen-px-2 zen-py-3 zen-align-middle zen-text-sm zen-text-zen-foreground",
});

export const TableCaption = styled<BaseProps>({
  tag: "caption",
  className: "zen-mt-3 zen-text-sm zen-text-zen-muted-fg",
});
