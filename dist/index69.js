import { template as N, insert as C, createComponent as q, memo as L, setAttribute as b, effect as h, className as f, delegateEvents as S } from "solid-js/web";
import { createSignal as E, createMemo as P, For as R } from "solid-js";
import { cn as v } from "./index106.js";
var U = /* @__PURE__ */ N("<div><input>"), V = /* @__PURE__ */ N('<span><span></span><button type=button><svg width=10 height=10 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=3 stroke-linecap=round stroke-linejoin=round aria-hidden><line x1=18 y1=6 x2=6 y2=18></line><line x1=6 y1=6 x2=18 y2=18>');
const O = (i) => {
  const k = () => i.value !== void 0, [A, B] = E(i.defaultValue ?? []), s = P(() => k() ? i.value : A()), [d, u] = E(""), x = () => i.delimiters ?? [","], y = () => i.unique ?? !0, w = (t) => i.normalize ? i.normalize(t) : t.trim(), m = (t) => {
    k() || B(t), i.onValueChange?.(t);
  }, z = async (t) => {
    const n = w(t);
    if (!n) return !1;
    const e = s();
    return y() && e.includes(n) ? !0 : i.max !== void 0 && e.length >= i.max || i.validate && !await i.validate(n) ? !1 : (m([...e, n]), !0);
  }, g = (t) => {
    const n = s().slice();
    n.splice(t, 1), m(n);
  }, I = async (t) => {
    const n = d();
    t.key === "Enter" ? (t.preventDefault(), await z(n) && u("")) : t.key === "Tab" && n.trim().length > 0 ? await z(n) && (t.preventDefault(), u("")) : t.key === "Backspace" && n.length === 0 && s().length > 0 ? g(s().length - 1) : x().includes(t.key) && n.trim().length > 0 && (t.preventDefault(), await z(n) && u(""));
  }, j = async (t) => {
    const n = t.clipboardData?.getData("text") ?? "";
    if (!n) return;
    const e = new RegExp(`[${x().map((o) => `\\${o}`).join("")}\\n\\r\\t]+`), a = n.split(e).map(w).filter(Boolean);
    if (a.length <= 1) return;
    t.preventDefault();
    let r = s();
    for (const o of a) {
      if (i.max !== void 0 && r.length >= i.max) break;
      y() && r.includes(o) || i.validate && !await i.validate(o) || (r = [...r, o]);
    }
    m(r);
  };
  return (() => {
    var t = U(), n = t.firstChild;
    return t.$$click = (e) => {
      const a = e.target;
      a.tagName !== "BUTTON" && a.tagName !== "INPUT" && e.currentTarget.querySelector("input")?.focus();
    }, C(t, q(R, {
      get each() {
        return s();
      },
      children: (e, a) => i.renderTag ? L(() => i.renderTag(e, () => g(a()))) : (() => {
        var r = V(), o = r.firstChild, c = o.nextSibling;
        return C(o, e), c.$$click = () => g(a()), b(c, "aria-label", `Remove ${e}`), h((l) => {
          var T = v("zen-inline-flex zen-items-center zen-gap-1 zen-px-2 zen-py-0.5", "zen-text-xs zen-font-medium", "zen-rounded-zen-full zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"), $ = i.disabled, D = v("zen-inline-flex zen-items-center zen-justify-center", "zen-h-4 zen-w-4 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer", "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10", "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring", "disabled:zen-cursor-not-allowed");
          return T !== l.e && f(r, l.e = T), $ !== l.t && (c.disabled = l.t = $), D !== l.a && f(c, l.a = D), l;
        }, {
          e: void 0,
          t: void 0,
          a: void 0
        }), r;
      })()
    }), n), n.addEventListener("blur", async () => {
      if (d().trim().length === 0) return;
      await z(d()) && u("");
    }), n.addEventListener("paste", j), n.$$keydown = I, n.$$input = (e) => u(e.currentTarget.value), h((e) => {
      var a = v("zen-flex zen-flex-wrap zen-items-center zen-gap-1.5", "zen-min-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background", "zen-px-2 zen-py-1.5 zen-text-sm", "focus-within:zen-outline-none focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2", i.disabled && "zen-opacity-50 zen-cursor-not-allowed", i.class), r = s().length === 0 ? i.placeholder ?? "Add a tag…" : "", o = i.disabled, c = i.inputAriaLabel, l = v("zen-flex-1 zen-min-w-[6rem] zen-bg-transparent zen-border-0", "zen-text-sm zen-outline-none placeholder:zen-text-zen-muted-fg", "disabled:zen-cursor-not-allowed");
      return a !== e.e && f(t, e.e = a), r !== e.t && b(n, "placeholder", e.t = r), o !== e.a && (n.disabled = e.a = o), c !== e.o && b(n, "aria-label", e.o = c), l !== e.i && f(n, e.i = l), e;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0
    }), h(() => n.value = d()), t;
  })();
};
S(["click", "input", "keydown"]);
export {
  O as TagInput
};
//# sourceMappingURL=index69.js.map
