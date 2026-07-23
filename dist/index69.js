import { template as c, insert as a, createComponent as z, memo as p, use as D, effect as V, className as E, setAttribute as y, delegateEvents as W } from "solid-js/web";
import { createSignal as L, createMemo as H, Show as _, For as O } from "solid-js";
import { Button as R } from "./index5.js";
import { cn as I } from "./index103.js";
var U = /* @__PURE__ */ c('<div class="zen-text-xs zen-text-zen-muted-fg">'), K = /* @__PURE__ */ c('<ul class="zen-flex zen-flex-col zen-gap-1 zen-text-sm">'), N = /* @__PURE__ */ c("<div><div role=button><div class=zen-text-sm></div><input type=file class=zen-sr-only>"), P = /* @__PURE__ */ c("<span class=zen-font-medium>Click to upload"), X = /* @__PURE__ */ c("<span class=zen-text-zen-muted-fg>or drag and drop"), q = /* @__PURE__ */ c('<div class="zen-text-xs zen-text-zen-muted-fg">Max <!> per file'), G = /* @__PURE__ */ c('<li class="zen-flex zen-items-center zen-gap-3 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2"><div class="zen-flex zen-flex-col zen-min-w-0 zen-flex-1"><span class="zen-truncate zen-font-medium"></span><span class="zen-text-xs zen-text-zen-muted-fg">'), J = /* @__PURE__ */ c('<svg width=32 height=32 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=1.5 stroke-linecap=round stroke-linejoin=round aria-hidden class=zen-text-zen-muted-fg><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1=12 y1=3 x2=12 y2=15>'), Q = /* @__PURE__ */ c('<svg width=18 height=18 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden class="zen-text-zen-muted-fg zen-shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8">'), Y = /* @__PURE__ */ c('<svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round aria-hidden><line x1=18 y1=6 x2=6 y2=18></line><line x1=6 y1=6 x2=18 y2=18>');
const C = (e) => e < 1024 ? `${e} B` : e < 1024 * 1024 ? `${(e / 1024).toFixed(1)} KB` : `${(e / 1024 / 1024).toFixed(1)} MB`, Z = (e, m) => m ? m.split(",").map((s) => s.trim()).filter(Boolean).some((s) => s.startsWith(".") ? e.name.toLowerCase().endsWith(s.toLowerCase()) : s.endsWith("/*") ? e.type.startsWith(s.slice(0, -1)) : e.type === s) : !0, se = (e) => {
  const m = () => e.value !== void 0, [S, s] = L(e.defaultValue ?? []), g = H(() => m() ? e.value : S());
  let x;
  const [M, k] = L(!1), w = () => e.maxFiles ?? (e.multiple ? 1 / 0 : 1), T = () => e.showFileList ?? !0, F = (r) => {
    const i = Array.from(r), o = [], l = [];
    for (const t of i) {
      if (typeof e.maxSize == "number" && t.size > e.maxSize) {
        o.push({
          file: t,
          reason: "size",
          message: `"${t.name}" exceeds ${C(e.maxSize)}`
        });
        continue;
      }
      if (!Z(t, e.accept)) {
        o.push({
          file: t,
          reason: "type",
          message: `"${t.name}" is not an accepted file type`
        });
        continue;
      }
      l.push(t);
    }
    let u = e.multiple ? [...g(), ...l] : l.slice(0, 1);
    const n = w();
    u.length > n && (u.slice(n).forEach((d) => o.push({
      file: d,
      reason: "max-files",
      message: `Maximum ${n} file(s); "${d.name}" dropped`
    })), u = u.slice(0, n)), o.length > 0 && e.onError?.(o), m() || s(u), e.onValueChange?.(u);
  }, j = (r) => {
    const i = g().filter((o, l) => l !== r);
    m() || s(i), e.onValueChange?.(i);
  }, A = (r) => {
    r.preventDefault(), k(!1), !e.disabled && r.dataTransfer?.files?.length && F(r.dataTransfer.files);
  };
  return (() => {
    var r = N(), i = r.firstChild, o = i.firstChild, l = o.nextSibling;
    i.$$keydown = (n) => {
      e.disabled || (n.key === "Enter" || n.key === " ") && (n.preventDefault(), x?.click());
    }, i.$$click = () => !e.disabled && x?.click(), i.addEventListener("drop", A), i.addEventListener("dragleave", () => k(!1)), i.addEventListener("dragover", (n) => {
      n.preventDefault(), e.disabled || k(!0);
    }), a(i, z(ee, {}), o), a(o, () => e.label ?? [P(), " ", X()]), a(i, z(_, {
      get when() {
        return e.helperText;
      },
      get fallback() {
        return z(_, {
          get when() {
            return e.maxSize;
          },
          get children() {
            var n = q(), t = n.firstChild, d = t.nextSibling;
            return d.nextSibling, a(n, () => C(e.maxSize), d), a(n, (() => {
              var f = p(() => !!(e.multiple && w() !== 1 / 0));
              return () => f() ? ` · up to ${w()} files` : "";
            })(), null), n;
          }
        });
      },
      get children() {
        var n = U();
        return a(n, () => e.helperText), n;
      }
    }), l), l.addEventListener("change", (n) => {
      n.currentTarget.files?.length && F(n.currentTarget.files), n.currentTarget.value = "";
    });
    var u = x;
    return typeof u == "function" ? D(u, l) : x = l, a(r, z(_, {
      get when() {
        return p(() => !!T())() && g().length > 0;
      },
      get children() {
        var n = K();
        return a(n, z(O, {
          get each() {
            return g();
          },
          children: (t, d) => (() => {
            var f = G(), v = f.firstChild, h = v.firstChild, b = h.nextSibling;
            return a(f, z(ne, {}), v), a(h, () => t.name), a(b, () => C(t.size)), a(f, z(R, {
              variant: "ghost",
              color: "neutral",
              size: "sm",
              get "aria-label"() {
                return `Remove ${t.name}`;
              },
              onClick: ($) => {
                $.stopPropagation(), j(d());
              },
              get disabled() {
                return e.disabled;
              },
              get children() {
                return z(te, {});
              }
            }), null), f;
          })()
        })), n;
      }
    }), null), V((n) => {
      var t = I("zen-flex zen-flex-col zen-gap-2", e.class), d = e.disabled ? -1 : 0, f = e.disabled || void 0, v = I("zen-rounded-zen-md zen-border-2 zen-border-dashed zen-p-6 zen-text-center zen-transition-colors zen-cursor-pointer", "zen-flex zen-flex-col zen-items-center zen-justify-center zen-gap-2", M() ? "zen-border-zen-primary zen-bg-zen-primary-soft" : "zen-border-zen-border zen-bg-zen-muted/30", "hover:zen-bg-zen-muted/60", e.disabled && "zen-opacity-50 zen-cursor-not-allowed zen-pointer-events-none", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2"), h = e.accept, b = e.multiple, $ = e.disabled, B = e.name;
      return t !== n.e && E(r, n.e = t), d !== n.t && y(i, "tabindex", n.t = d), f !== n.a && y(i, "aria-disabled", n.a = f), v !== n.o && E(i, n.o = v), h !== n.i && y(l, "accept", n.i = h), b !== n.n && (l.multiple = n.n = b), $ !== n.s && (l.disabled = n.s = $), B !== n.h && y(l, "name", n.h = B), n;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0,
      n: void 0,
      s: void 0,
      h: void 0
    }), r;
  })();
}, ee = () => J(), ne = () => Q(), te = () => Y();
W(["click", "keydown"]);
export {
  se as FileUpload
};
//# sourceMappingURL=index69.js.map
