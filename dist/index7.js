import { template as o, spread as u, mergeProps as h, insert as r, createComponent as z, effect as g, className as p } from "solid-js/web";
import { splitProps as m, Show as a } from "solid-js";
import { cn as i } from "./index103.js";
var f = /* @__PURE__ */ o("<div class=zen-shrink-0>"), b = /* @__PURE__ */ o("<div><div>"), v = /* @__PURE__ */ o('<div class="zen-flex zen-min-w-0 zen-items-center zen-gap-2 zen-overflow-hidden">'), _ = /* @__PURE__ */ o('<div><div class="zen-flex zen-flex-1 zen-items-center zen-gap-2"></div><div class="zen-flex zen-flex-1 zen-items-center zen-justify-end zen-gap-2">');
const k = (s) => {
  const [e, d] = m(s, ["header", "footer", "flush", "class", "children"]);
  return (
    // `h-full`, not `min-h-full`. min-height is a floor, not a ceiling: a page
    // that grows to fit its content means the content area never scrolls — it
    // just expands — and the overflow lands on whatever ancestor can take it,
    // producing a second scrollbar. That exact bug shipped in the demo shell.
    (() => {
      var n = b(), l = n.firstChild;
      return u(n, h({
        get class() {
          return i("zen-flex zen-h-full zen-flex-col zen-overflow-hidden", e.class);
        }
      }, d), !1, !0), r(n, z(a, {
        get when() {
          return e.header;
        },
        get children() {
          var t = f();
          return r(t, () => e.header), t;
        }
      }), l), r(l, () => e.children), r(n, z(a, {
        get when() {
          return e.footer;
        },
        get children() {
          var t = f();
          return r(t, () => e.footer), t;
        }
      }), null), g(() => p(l, i("zen-min-h-0 zen-flex-1 zen-overflow-y-auto", !e.flush && "zen-p-4"))), n;
    })()
  );
}, x = {
  header: "zen-border-b zen-border-zen-border zen-bg-zen-background",
  subheader: "zen-border-b zen-border-zen-border zen-bg-zen-muted",
  footer: "zen-border-t zen-border-zen-border zen-bg-zen-background"
}, y = (s) => {
  const [e, d] = m(s, ["startContent", "middleContent", "endContent", "design", "class"]);
  return (() => {
    var n = _(), l = n.firstChild, t = l.nextSibling;
    return u(n, h({
      get class() {
        return i("zen-flex zen-w-full zen-items-center zen-gap-2 zen-px-4 zen-py-2", x[e.design ?? "header"], e.class);
      }
    }, d), !1, !0), r(l, () => e.startContent), r(n, z(a, {
      get when() {
        return e.middleContent;
      },
      get children() {
        var c = v();
        return r(c, () => e.middleContent), c;
      }
    }), t), r(t, () => e.endContent), n;
  })();
};
export {
  y as Bar,
  k as Page
};
//# sourceMappingURL=index7.js.map
