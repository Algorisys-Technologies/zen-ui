import { template as z, insert as v, createComponent as f, use as y, effect as k, setAttribute as w, className as C, setStyleProperty as L } from "solid-js/web";
import { createSignal as M, createMemo as T, onMount as j, onCleanup as E, createEffect as H, on as S, Show as s } from "solid-js";
import { cn as _ } from "./index106.js";
var $ = /* @__PURE__ */ z('<div class="zen-mb-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-py-2 zen-text-xs zen-text-zen-muted-fg"role=status>Rich-text toolbar unavailable — run <code>npm install jodit</code> and import <code>jodit/es2021/jodit.min.css</code>. Editing still works below as plain text.'), J = /* @__PURE__ */ z('<div class="zen-text-sm zen-text-zen-muted-fg">Loading editor…'), P = /* @__PURE__ */ z("<div contenteditable role=textbox aria-multiline=true>"), R = /* @__PURE__ */ z("<div><div><div>");
const B = (o) => {
  const [l, d] = M("loading");
  let u, c, r = null;
  const m = () => o.value ?? "", p = T(() => ({
    readonly: !1,
    placeholder: o.placeholder ?? "",
    // Jodit's beforeInitHook fetches `<basePath>config.js` when
    // loadExternalConfig is on (its default), so every RichText mount fired a
    // request for a file zen-ui does not ship and never will — a guaranteed 404
    // in the console of any app using it. Nothing reads the response; turning it
    // off removes a failed request per mount and nothing else. A caller who DOES
    // host a jodit config can turn it back on through `config`, since theirs is
    // spread after this.
    loadExternalConfig: !1,
    ...o.config
  }));
  return j(async () => {
    let e;
    try {
      e = await import("jodit");
    } catch {
      d("fallback");
      return;
    }
    const a = e?.Jodit ?? e?.default?.Jodit;
    if (!u || typeof a?.make != "function") {
      d("fallback");
      return;
    }
    try {
      r = a.make(u, p());
    } catch {
      d("fallback");
      return;
    }
    r.value = m(), r.events.on("blur", () => o.onChange?.(r.value)), d("jodit");
  }), E(() => {
    r?.destruct?.(), r = null;
  }), H(S(m, (e) => {
    r && r.value !== e && (r.value = e), c && c.innerHTML !== e && (c.innerHTML = e);
  })), (() => {
    var e = R(), a = e.firstChild, g = a.firstChild;
    v(e, f(s, {
      get when() {
        return l() !== "loading";
      },
      get children() {
        return f(s, {
          get when() {
            return l() === "fallback";
          },
          get children() {
            return $();
          }
        });
      }
    }), a), v(e, f(s, {
      get when() {
        return l() === "loading";
      },
      get children() {
        return J();
      }
    }), a);
    var b = u;
    return typeof b == "function" ? y(b, g) : u = g, v(e, f(s, {
      get when() {
        return l() === "fallback";
      },
      get children() {
        var n = P();
        return n.addEventListener("blur", (t) => o.onChange?.(t.currentTarget.innerHTML)), y((t) => {
          c = t, t.innerHTML = m();
        }, n), k((t) => {
          var i = o.placeholder, h = o.placeholder, x = _("zen-min-h-32 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-3 zen-text-sm zen-text-zen-foreground", "focus:zen-outline-none focus:zen-ring-2 focus:zen-ring-zen-ring focus:zen-ring-offset-2", "empty:before:zen-text-zen-muted-fg empty:before:zen-content-[attr(data-placeholder)]");
          return i !== t.e && w(n, "aria-label", t.e = i), h !== t.t && w(n, "data-placeholder", t.t = h), x !== t.a && C(n, t.a = x), t;
        }, {
          e: void 0,
          t: void 0,
          a: void 0
        }), n;
      }
    }), null), k((n) => {
      var t = o.class, i = l() === "jodit" ? void 0 : "none";
      return t !== n.e && C(e, n.e = t), i !== n.t && L(a, "display", n.t = i), n;
    }, {
      e: void 0,
      t: void 0
    }), e;
  })();
};
export {
  B as RichText
};
//# sourceMappingURL=index102.js.map
