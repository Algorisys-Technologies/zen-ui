import { jsx as o } from "react/jsx-runtime";
import * as r from "react";
import { cn as n } from "./index143.js";
const s = r.forwardRef(
  ({ className: e, containerClassName: a, containerStyle: t, ...l }, d) => /* @__PURE__ */ o(
    "div",
    {
      className: n("zen-relative zen-w-full zen-overflow-auto", a),
      style: t,
      children: /* @__PURE__ */ o(
        "table",
        {
          ref: d,
          className: n("zen-w-full zen-caption-bottom zen-text-sm zen-border-collapse", e),
          ...l
        }
      )
    }
  )
);
s.displayName = "Table";
const z = r.forwardRef(({ className: e, ...a }, t) => /* @__PURE__ */ o(
  "thead",
  {
    ref: t,
    className: n("[&_tr]:zen-border-b [&_tr]:zen-border-zen-border", e),
    ...a
  }
));
z.displayName = "TableHeader";
const m = r.forwardRef(({ className: e, ...a }, t) => /* @__PURE__ */ o(
  "tbody",
  {
    ref: t,
    className: n("[&_tr:last-child]:zen-border-0", e),
    ...a
  }
));
m.displayName = "TableBody";
const b = r.forwardRef(({ className: e, ...a }, t) => /* @__PURE__ */ o(
  "tfoot",
  {
    ref: t,
    className: n(
      "zen-border-t zen-border-zen-border zen-bg-zen-muted/50 zen-font-medium",
      e
    ),
    ...a
  }
));
b.displayName = "TableFooter";
const i = r.forwardRef(({ className: e, ...a }, t) => /* @__PURE__ */ o(
  "tr",
  {
    ref: t,
    className: n(
      "zen-border-b zen-border-zen-border",
      "zen-transition-[background-color,box-shadow,outline-color] zen-duration-100",
      // hover (Zen theme: subtle bg tint + sm drop shadow + slightly darker border tint)
      "hover:zen-bg-zen-muted/50 hover:zen-shadow-zen-sm",
      // selected (Zen theme: primary-soft bg + 1px primary inside outline + primary-tinted lg shadow)
      "data-[state=selected]:zen-bg-zen-primary-soft",
      "data-[state=selected]:zen-[box-shadow:0_4px_12px_0_var(--zen-color-primary-soft)]",
      "data-[state=selected]:zen-outline data-[state=selected]:zen-outline-1 data-[state=selected]:-zen-outline-offset-1 data-[state=selected]:zen-outline-zen-primary",
      e
    ),
    ...a
  }
));
i.displayName = "TableRow";
const c = r.forwardRef(({ className: e, ...a }, t) => /* @__PURE__ */ o(
  "th",
  {
    ref: t,
    className: n(
      // Zen theme header: 8px padding, Paragraph XSmall Medium, Neutral/200 (muted-fg)
      "zen-h-10 zen-px-2 zen-py-2 zen-text-start zen-align-middle zen-font-medium zen-text-xs",
      "zen-text-zen-muted-fg",
      e
    ),
    ...a
  }
));
c.displayName = "TableHead";
const f = r.forwardRef(({ className: e, ...a }, t) => /* @__PURE__ */ o(
  "td",
  {
    ref: t,
    className: n(
      // Zen theme cell: 8px horizontal, 12px vertical
      "zen-px-2 zen-py-3 zen-align-middle zen-text-sm zen-text-zen-foreground",
      e
    ),
    ...a
  }
));
f.displayName = "TableCell";
const p = r.forwardRef(({ className: e, ...a }, t) => /* @__PURE__ */ o(
  "caption",
  {
    ref: t,
    className: n("zen-mt-3 zen-text-sm zen-text-zen-muted-fg", e),
    ...a
  }
));
p.displayName = "TableCaption";
export {
  s as Table,
  m as TableBody,
  p as TableCaption,
  f as TableCell,
  b as TableFooter,
  c as TableHead,
  z as TableHeader,
  i as TableRow
};
//# sourceMappingURL=index92.js.map
