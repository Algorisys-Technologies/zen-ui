import { untrack as u } from "solid-js";
import { getFieldArrayStore as c } from "./index219.js";
import { getFieldStore as a } from "./index215.js";
function j(e, i, { shouldActive: n = !0 }) {
  const t = Object.entries(i).reduce((r, [o, p]) => ([
    a(e, o),
    c(e, o)
  ].every((s) => !s || n && !u(s.active.get)) && r.push(p), r), []).join(" ");
  t && e.internal.response.set({
    status: "error",
    message: t
  });
}
export {
  j as setErrorResponse
};
//# sourceMappingURL=index224.js.map
