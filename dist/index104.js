import { jsx as n } from "react/jsx-runtime";
import * as r from "react";
import { cn as o } from "./index160.js";
const s = r.forwardRef(
  ({ className: e, containerClassName: a, containerStyle: t, ...l }, d) => /* @__PURE__ */ n(
    "div",
    {
      className: o("zen-relative zen-w-full zen-overflow-auto", a),
      style: t,
      children: /* @__PURE__ */ n(
        "table",
        {
          ref: d,
          className: o("zen-w-full zen-caption-bottom zen-text-sm zen-border-collapse", e),
          ...l
        }
      )
    }
  )
);
s.displayName = "Table";
const z = r.forwardRef(({ className: e, ...a }, t) => /* @__PURE__ */ n(
  "thead",
  {
    ref: t,
    className: o("[&_tr]:zen-border-b [&_tr]:zen-border-zen-border", e),
    ...a
  }
));
z.displayName = "TableHeader";
const i = r.forwardRef(({ className: e, ...a }, t) => /* @__PURE__ */ n(
  "tbody",
  {
    ref: t,
    className: o("[&_tr:last-child]:zen-border-0", e),
    ...a
  }
));
i.displayName = "TableBody";
const b = r.forwardRef(({ className: e, ...a }, t) => /* @__PURE__ */ n(
  "tfoot",
  {
    ref: t,
    className: o(
      "zen-border-t zen-border-zen-border zen-bg-zen-muted/50 zen-font-medium",
      e
    ),
    ...a
  }
));
b.displayName = "TableFooter";
const c = r.forwardRef(({ className: e, ...a }, t) => /* @__PURE__ */ n(
  "tr",
  {
    ref: t,
    className: o(
      "zen-border-b zen-border-zen-border",
      "zen-transition-[background-color,box-shadow,outline-color] zen-duration-100",
      // hover (Zen theme: subtle bg tint + sm drop shadow + slightly darker border tint)
      // The hover colour is --zen-table-row-hover (core tokens.css), whose
      // default is the muted colour this always drew (the old "/50" opacity
      // generated no CSS of its own over a var() colour: measured, same rule).
      "hover:zen-[background-color:var(--zen-table-row-hover)] hover:zen-shadow-zen-sm",
      // selected (Zen theme: primary-soft bg + 1px primary inside outline + primary-tinted lg shadow)
      "data-[state=selected]:zen-bg-zen-primary-soft",
      "data-[state=selected]:zen-[box-shadow:0_4px_12px_0_var(--zen-color-primary-soft)]",
      "data-[state=selected]:zen-outline data-[state=selected]:zen-outline-1 data-[state=selected]:-zen-outline-offset-1 data-[state=selected]:zen-outline-zen-primary",
      e
    ),
    ...a
  }
));
c.displayName = "TableRow";
const m = r.forwardRef(({ className: e, ...a }, t) => /* @__PURE__ */ n(
  "th",
  {
    ref: t,
    className: o(
      // Zen theme header: 8px padding, Paragraph XSmall Medium, Neutral/200 (muted-fg)
      // The look comes from the --zen-table-* tokens (core tokens.css), whose
      // defaults are what this always drew: 12px/16px, medium, no transform.
      "zen-h-zen-head zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-2 zen-text-start zen-align-middle",
      "zen-[font-size:var(--zen-table-head-font-size)] zen-[line-height:var(--zen-line-height-xs)] zen-[font-weight:var(--zen-table-head-font-weight)]",
      "zen-[text-transform:var(--zen-table-head-text-transform)] zen-[letter-spacing:var(--zen-table-head-letter-spacing)]",
      "zen-text-zen-muted-fg",
      e
    ),
    ...a
  }
));
m.displayName = "TableHead";
const f = r.forwardRef(({ className: e, ...a }, t) => /* @__PURE__ */ n(
  "td",
  {
    ref: t,
    className: o(
      // Zen theme cell: 8px horizontal, 12px vertical
      "zen-[padding-inline:var(--zen-table-cell-padding-x)] zen-py-zen-cell-y zen-align-middle zen-text-sm zen-text-zen-foreground",
      e
    ),
    ...a
  }
));
f.displayName = "TableCell";
const p = r.forwardRef(({ className: e, ...a }, t) => /* @__PURE__ */ n(
  "caption",
  {
    ref: t,
    className: o("zen-mt-3 zen-text-sm zen-text-zen-muted-fg", e),
    ...a
  }
));
p.displayName = "TableCaption";
export {
  s as Table,
  i as TableBody,
  p as TableCaption,
  f as TableCell,
  b as TableFooter,
  m as TableHead,
  z as TableHeader,
  c as TableRow
};
//# sourceMappingURL=index104.js.map
