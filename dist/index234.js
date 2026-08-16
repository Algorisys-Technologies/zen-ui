import e from "react";
function c(f) {
  const { day: r, modifiers: t, ...u } = f, o = e.useRef(null);
  return e.useEffect(() => {
    t.focused && o.current?.focus();
  }, [t.focused]), e.createElement("button", { ref: o, ...u });
}
export {
  c as DayButton
};
//# sourceMappingURL=index234.js.map
