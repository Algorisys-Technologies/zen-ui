import { createComponent as t, template as a, insert as r, effect as m, className as g, setAttribute as b, memo as $, use as C, delegateEvents as E } from "solid-js/web";
import { Show as i, For as U, createSignal as F } from "solid-js";
import { Button as x } from "./index5.js";
import { Icon as _ } from "./index21.js";
import { Progress as M } from "./index44.js";
import { cn as f } from "./index103.js";
var S = /* @__PURE__ */ a('<img alt class="zen-mt-0.5 zen-h-9 zen-w-9 zen-shrink-0 zen-rounded-zen-sm zen-object-cover">'), j = /* @__PURE__ */ a('<input class="zen-w-full zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1 zen-text-sm focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring">'), A = /* @__PURE__ */ a('<span class="zen-text-xs zen-text-zen-error">'), D = /* @__PURE__ */ a('<li><div class="zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-1"></div><div class="zen-flex zen-shrink-0 zen-items-center zen-gap-1">'), N = /* @__PURE__ */ a("<span aria-hidden=true>"), q = /* @__PURE__ */ a('<a class="zen-truncate zen-text-sm zen-font-medium zen-text-zen-primary hover:zen-underline">'), I = /* @__PURE__ */ a('<span class="zen-truncate zen-text-sm zen-font-medium">'), K = /* @__PURE__ */ a('<span class="zen-text-xs zen-text-zen-muted-fg">'), L = /* @__PURE__ */ a("<ul>"), O = /* @__PURE__ */ a("<p>");
const P = (e) => e < 1024 ? `${e} B` : e < 1024 * 1024 ? `${(e / 1024).toFixed(1)} KB` : `${(e / 1024 / 1024).toFixed(1)} MB`, y = (e) => {
  const l = e.status ?? "complete";
  return [l === "pending" ? "Queued" : l === "uploading" && e.progress === void 0 ? "Uploading…" : void 0, e.size !== void 0 ? P(e.size) : void 0, e.uploadedAt, e.uploadedBy].filter(Boolean).join(" · ");
}, Q = (e) => {
  const [l, d] = F(!1);
  let z, h = !1;
  const o = () => e.item.status ?? "complete", k = () => o() === "uploading" || o() === "pending", R = () => {
    if (!l()) return;
    if (h) {
      h = !1;
      return;
    }
    const u = z?.value.trim() ?? "";
    d(!1), u && u !== e.item.name && e.onRename?.(e.item, u);
  }, B = () => {
    h = !0, d(!1);
  };
  return (() => {
    var u = D(), s = u.firstChild, v = s.nextSibling;
    return r(u, t(i, {
      get when() {
        return e.item.thumbnail;
      },
      get fallback() {
        return (() => {
          var n = N();
          return r(n, t(_, {
            get name() {
              return o() === "error" ? "x-circle" : "file";
            },
            size: 18
          })), m(() => g(n, f("zen-mt-0.5 zen-shrink-0", o() === "error" ? "zen-text-zen-error" : "zen-text-zen-muted-fg"))), n;
        })();
      },
      get children() {
        var n = S();
        return m(() => b(n, "src", e.item.thumbnail)), n;
      }
    }), s), r(s, t(i, {
      get when() {
        return l();
      },
      get fallback() {
        return t(i, {
          get when() {
            return e.item.url;
          },
          get fallback() {
            return (() => {
              var n = I();
              return r(n, () => e.item.name), n;
            })();
          },
          get children() {
            var n = q();
            return r(n, () => e.item.name), m(() => b(n, "href", e.item.url)), n;
          }
        });
      },
      get children() {
        var n = j();
        n.addEventListener("blur", R), n.$$keydown = (c) => {
          c.key === "Enter" ? (c.preventDefault(), R()) : c.key === "Escape" && (c.preventDefault(), B());
        };
        var w = z;
        return typeof w == "function" ? C(w, n) : z = n, m(() => b(n, "aria-label", `Rename ${e.item.name}`)), m(() => n.value = e.item.name), n;
      }
    }), null), r(s, t(i, {
      get when() {
        return o() === "error";
      },
      get fallback() {
        return t(i, {
          get when() {
            return y(e.item);
          },
          get children() {
            var n = K();
            return r(n, () => y(e.item)), n;
          }
        });
      },
      get children() {
        var n = A();
        return r(n, () => e.item.error ?? "Upload failed"), n;
      }
    }), null), r(s, t(i, {
      get when() {
        return $(() => !!k())() && e.item.progress !== void 0;
      },
      get children() {
        return t(M, {
          size: "sm",
          get value() {
            return e.item.progress;
          },
          get "aria-label"() {
            return `Uploading ${e.item.name}`;
          }
        });
      }
    }), null), r(v, t(i, {
      get when() {
        return $(() => o() === "error")() && e.onRetry;
      },
      get children() {
        return t(x, {
          variant: "outline",
          size: "sm",
          get disabled() {
            return e.disabled;
          },
          onClick: () => e.onRetry?.(e.item),
          children: "Retry"
        });
      }
    }), null), r(v, t(i, {
      get when() {
        return $(() => !!e.onRename)() && !k();
      },
      get children() {
        return t(x, {
          variant: "ghost",
          color: "neutral",
          size: "sm",
          get "aria-label"() {
            return `Rename ${e.item.name}`;
          },
          get disabled() {
            return e.disabled;
          },
          onClick: () => {
            d(!0), queueMicrotask(() => {
              z?.focus(), z?.select();
            });
          },
          get children() {
            return t(_, {
              name: "edit",
              size: 14
            });
          }
        });
      }
    }), null), r(v, t(i, {
      get when() {
        return e.onRemove;
      },
      get children() {
        return t(x, {
          variant: "ghost",
          color: "neutral",
          size: "sm",
          get "aria-label"() {
            return `Remove ${e.item.name}`;
          },
          get disabled() {
            return e.disabled;
          },
          onClick: () => e.onRemove?.(e.item),
          get children() {
            return t(_, {
              name: "trash",
              size: 14
            });
          }
        });
      }
    }), null), m(() => g(u, f("zen-flex zen-items-start zen-gap-3 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2", o() === "error" && "zen-border-zen-error/40"))), u;
  })();
}, X = (e) => t(i, {
  get when() {
    return (e.items ?? []).length > 0;
  },
  get fallback() {
    return (
      /* `class` reaches the empty state too. A caller who sized the list — a
         width, a max-width, a border — meant the box the files live in, and a
         message that ignored it would jump the layout the moment the last file
         was removed. */
      (() => {
        var l = O();
        return r(l, () => e.emptyMessage ?? "No files yet"), m(() => g(l, f("zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg", e.class))), l;
      })()
    );
  },
  get children() {
    var l = L();
    return r(l, t(U, {
      get each() {
        return e.items;
      },
      children: (d) => t(Q, {
        item: d,
        get disabled() {
          return e.disabled;
        },
        get onRemove() {
          return e.onRemove;
        },
        get onRetry() {
          return e.onRetry;
        },
        get onRename() {
          return e.onRename;
        }
      })
    })), m(() => g(l, f("zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0", e.class))), l;
  }
});
E(["keydown"]);
export {
  X as UploadCollection
};
//# sourceMappingURL=index75.js.map
