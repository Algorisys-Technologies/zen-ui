import t from "react";
import { UI as e } from "./index269.js";
import { useDayPicker as f } from "./index272.js";
function N(c) {
  const { options: r, className: i, ...s } = c, { classNames: o, components: n, styles: l } = f(), m = [o[e.Dropdown], i].join(" "), p = r?.find(({ value: a }) => a === s.value);
  return t.createElement(
    "span",
    { "data-disabled": s.disabled, className: o[e.DropdownRoot], style: l?.[e.DropdownRoot] },
    t.createElement(n.Select, { className: m, ...s }, r?.map(({ value: a, label: d, disabled: b }) => t.createElement(n.Option, { key: a, value: a, disabled: b }, d))),
    t.createElement(
      "span",
      { className: o[e.CaptionLabel], style: l?.[e.CaptionLabel], "aria-hidden": !0 },
      p?.label,
      t.createElement(n.Chevron, { orientation: "down", size: 18, className: o[e.Chevron], style: l?.[e.Chevron] })
    )
  );
}
export {
  N as Dropdown
};
//# sourceMappingURL=index235.js.map
