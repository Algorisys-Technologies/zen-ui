import { defaultDateLib as D } from "./index256.js";
function w(f, g, n = 0, s = 0, l = !1, u = D) {
  const { from: o, to: i } = g || {}, { isSameDay: r, isAfter: m, isBefore: c } = u;
  let e;
  if (!o && !i)
    e = { from: f, to: n > 0 ? void 0 : f };
  else if (o && !i)
    r(o, f) ? n === 0 ? e = { from: o, to: f } : l ? e = { from: o, to: void 0 } : e = void 0 : c(f, o) ? e = { from: f, to: o } : e = { from: o, to: f };
  else if (o && i)
    if (r(o, f) && r(i, f))
      l ? e = { from: o, to: i } : e = void 0;
    else if (r(o, f))
      e = { from: o, to: n > 0 ? void 0 : f };
    else if (r(i, f))
      e = { from: f, to: n > 0 ? void 0 : f };
    else if (c(f, o))
      e = { from: f, to: i };
    else if (m(f, o))
      e = { from: o, to: f };
    else if (m(f, i))
      e = { from: o, to: f };
    else
      throw new Error("Invalid range");
  if (e?.from && e?.to) {
    const t = u.differenceInCalendarDays(e.to, e.from);
    s > 0 && t > s ? e = { from: f, to: void 0 } : n > 1 && t < n && (e = { from: f, to: void 0 });
  }
  return e;
}
export {
  w as addToRange
};
//# sourceMappingURL=index360.js.map
