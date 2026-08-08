import { useControlledValue as x } from "./index365.js";
function C(i, d) {
  const { selected: s, required: f, onSelect: l } = i, [r, m] = x(s, l ? s : void 0), e = l ? s : r, { isSameDay: o } = d, u = (t) => e?.some((c) => o(c, t)) ?? !1, { min: S, max: a } = i;
  return {
    selected: e,
    select: (t, c, h) => {
      let n = [...e ?? []];
      if (u(t)) {
        if (e?.length === S || f && e?.length === 1)
          return;
        n = e?.filter((y) => !o(y, t));
      } else
        e?.length === a ? n = [t] : n = [...n, t];
      return l || m(n), l?.(n, t, c, h), n;
    },
    isSelected: u
  };
}
export {
  C as useMulti
};
//# sourceMappingURL=index368.js.map
