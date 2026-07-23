import { template as n, spread as a, mergeProps as o, effect as f, className as i, style as b } from "solid-js/web";
import { splitProps as c } from "solid-js";
import { cn as l } from "./index103.js";
var p = /* @__PURE__ */ n("<div><table>"), _ = /* @__PURE__ */ n("<thead>"), v = /* @__PURE__ */ n("<tbody>"), g = /* @__PURE__ */ n("<tfoot>"), x = /* @__PURE__ */ n("<tr>"), $ = /* @__PURE__ */ n("<th>"), h = /* @__PURE__ */ n("<td>"), y = /* @__PURE__ */ n("<caption>");
const H = (r) => {
  const [t, s] = c(r, ["class", "containerClass", "containerStyle"]);
  return (() => {
    var e = p(), u = e.firstChild;
    return a(u, o({
      get class() {
        return l("zen-w-full zen-caption-bottom zen-text-sm zen-border-collapse", t.class);
      }
    }, s), !1, !1), f((z) => {
      var d = l("zen-relative zen-w-full zen-overflow-auto", t.containerClass), m = t.containerStyle;
      return d !== z.e && i(e, z.e = d), z.t = b(e, m, z.t), z;
    }, {
      e: void 0,
      t: void 0
    }), e;
  })();
}, P = (r) => {
  const [t, s] = c(r, ["class"]);
  return (() => {
    var e = _();
    return a(e, o({
      get class() {
        return l("[&_tr]:zen-border-b [&_tr]:zen-border-zen-border", t.class);
      }
    }, s), !1, !1), e;
  })();
}, S = (r) => {
  const [t, s] = c(r, ["class"]);
  return (() => {
    var e = v();
    return a(e, o({
      get class() {
        return l("[&_tr:last-child]:zen-border-0", t.class);
      }
    }, s), !1, !1), e;
  })();
}, k = (r) => {
  const [t, s] = c(r, ["class"]);
  return (() => {
    var e = g();
    return a(e, o({
      get class() {
        return l("zen-border-t zen-border-zen-border zen-bg-zen-muted/50 zen-font-medium", t.class);
      }
    }, s), !1, !1), e;
  })();
}, B = (r) => {
  const [t, s] = c(r, ["class"]);
  return (() => {
    var e = x();
    return a(e, o({
      get class() {
        return l("zen-border-b zen-border-zen-border", "zen-transition-[background-color,box-shadow,outline-color] zen-duration-100", "hover:zen-bg-zen-muted/50 hover:zen-shadow-zen-sm", "data-[state=selected]:zen-bg-zen-primary-soft", "data-[state=selected]:zen-[box-shadow:0_4px_12px_0_var(--zen-color-primary-soft)]", "data-[state=selected]:zen-outline data-[state=selected]:zen-outline-1 data-[state=selected]:-zen-outline-offset-1 data-[state=selected]:zen-outline-zen-primary", t.class);
      }
    }, s), !1, !1), e;
  })();
}, F = (r) => {
  const [t, s] = c(r, ["class"]);
  return (() => {
    var e = $();
    return a(e, o({
      get class() {
        return l("zen-h-10 zen-px-2 zen-py-2 zen-text-start zen-align-middle zen-font-medium zen-text-xs", "zen-text-zen-muted-fg", t.class);
      }
    }, s), !1, !1), e;
  })();
}, N = (r) => {
  const [t, s] = c(r, ["class"]);
  return (() => {
    var e = h();
    return a(e, o({
      get class() {
        return l("zen-px-2 zen-py-3 zen-align-middle zen-text-sm zen-text-zen-foreground", t.class);
      }
    }, s), !1, !1), e;
  })();
}, R = (r) => {
  const [t, s] = c(r, ["class"]);
  return (() => {
    var e = y();
    return a(e, o({
      get class() {
        return l("zen-mt-3 zen-text-sm zen-text-zen-muted-fg", t.class);
      }
    }, s), !1, !1), e;
  })();
};
export {
  H as Table,
  S as TableBody,
  R as TableCaption,
  N as TableCell,
  k as TableFooter,
  F as TableHead,
  P as TableHeader,
  B as TableRow
};
//# sourceMappingURL=index70.js.map
