import { toDate as o } from "./index390.js";
function l(t) {
  const e = o(t), n = new Date(
    Date.UTC(
      e.getFullYear(),
      e.getMonth(),
      e.getDate(),
      e.getHours(),
      e.getMinutes(),
      e.getSeconds(),
      e.getMilliseconds()
    )
  );
  return n.setUTCFullYear(e.getFullYear()), +t - +n;
}
export {
  l as getTimezoneOffsetInMilliseconds
};
//# sourceMappingURL=index392.js.map
