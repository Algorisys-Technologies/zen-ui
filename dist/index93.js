import { template as s, spread as a, insert as i, mergeProps as c, createComponent as u, Dynamic as d, memo as m } from "solid-js/web";
import { splitProps as l, mergeProps as p, Show as z } from "solid-js";
import { cn as o } from "./index103.js";
var g = /* @__PURE__ */ s("<nav aria-label=breadcrumb>"), f = /* @__PURE__ */ s("<ol>"), h = /* @__PURE__ */ s("<li>"), b = /* @__PURE__ */ s("<span role=link aria-disabled=true aria-current=page>"), v = /* @__PURE__ */ s("<li role=presentation aria-hidden=true>"), $ = /* @__PURE__ */ s("<span aria-hidden=true>/"), _ = /* @__PURE__ */ s("<span role=presentation aria-hidden=true>…<span class=zen-sr-only>More");
const P = (t) => {
  const [r, n] = l(t, ["separator", "children"]);
  return (() => {
    var e = g();
    return a(e, n, !1, !0), i(e, () => r.children), e;
  })();
}, k = (t) => {
  const [r, n] = l(t, ["class", "children"]);
  return (() => {
    var e = f();
    return a(e, c({
      get class() {
        return o("zen-flex zen-flex-wrap zen-items-center zen-gap-1.5 zen-break-words zen-text-sm zen-text-zen-muted-fg sm:zen-gap-2.5", r.class);
      }
    }, n), !1, !0), i(e, () => r.children), e;
  })();
}, y = (t) => {
  const [r, n] = l(t, ["class", "children"]);
  return (() => {
    var e = h();
    return a(e, c({
      get class() {
        return o("zen-inline-flex zen-items-center zen-gap-1.5", r.class);
      }
    }, n), !1, !0), i(e, () => r.children), e;
  })();
}, L = (t) => {
  const r = p({
    as: "a"
  }, t), [n, e] = l(r, ["as", "class", "children"]);
  return u(d, c({
    get component() {
      return n.as;
    },
    get class() {
      return o("zen-rounded-zen-sm zen-transition-colors hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2", n.class);
    }
  }, e, {
    get children() {
      return n.children;
    }
  }));
}, S = (t) => {
  const [r, n] = l(t, ["class", "children"]);
  return (() => {
    var e = b();
    return a(e, c({
      get class() {
        return o("zen-font-medium zen-text-zen-foreground", r.class);
      }
    }, n), !1, !0), i(e, () => r.children), e;
  })();
}, j = (t) => {
  const [r, n] = l(t, ["class", "children"]);
  return (() => {
    var e = v();
    return a(e, c({
      get class() {
        return o("[&>svg]:zen-size-3.5 zen-text-zen-muted-fg", r.class);
      }
    }, n), !1, !0), i(e, u(z, {
      get when() {
        return m(() => r.children !== void 0)() && r.children !== null;
      },
      get fallback() {
        return $();
      },
      get children() {
        return r.children;
      }
    })), e;
  })();
}, C = (t) => {
  const [r, n] = l(t, ["class", "children"]);
  return (() => {
    var e = _();
    return a(e, c({
      get class() {
        return o("zen-flex zen-h-9 zen-w-9 zen-items-center zen-justify-center", r.class);
      }
    }, n), !1, !0), e;
  })();
};
export {
  P as Breadcrumb,
  C as BreadcrumbEllipsis,
  y as BreadcrumbItem,
  L as BreadcrumbLink,
  k as BreadcrumbList,
  S as BreadcrumbPage,
  j as BreadcrumbSeparator
};
//# sourceMappingURL=index93.js.map
