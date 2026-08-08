import * as t from "react";
var e = !1;
function u() {
  const [s, a] = t.useState(e);
  return t.useEffect(() => {
    e || (e = !0, a(!0));
  }, []), s;
}
var r = t[" useSyncExternalStore ".trim().toString()];
function n() {
  return () => {
  };
}
function d() {
  return r(
    n,
    () => !0,
    () => !1
  );
}
var o = typeof r == "function" ? d : u;
export {
  o as useIsHydrated
};
//# sourceMappingURL=index220.js.map
