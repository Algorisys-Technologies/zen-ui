import { createComponent as o, mergeProps as l, memo as i, template as a, insert as z, spread as b } from "solid-js/web";
import { createSignal as u, createContext as f, splitProps as d, useContext as x, createRenderEffect as w } from "solid-js";
import { DropdownMenu as r } from "./index130.js";
import { cn as c } from "./index103.js";
var g = /* @__PURE__ */ a('<span class="zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center">'), v = /* @__PURE__ */ a("<span>"), D = /* @__PURE__ */ a('<svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><polyline points="20 6 9 17 4 12">'), C = /* @__PURE__ */ a('<svg width=8 height=8 viewBox="0 0 24 24"fill=currentColor><circle cx=12 cy=12 r=6>'), M = /* @__PURE__ */ a('<svg width=14 height=14 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=zen-ml-auto><polyline points="9 18 15 12 9 6">');
const E = r.Trigger, G = r.Group, O = r.Portal, R = r.Sub, A = r.RadioGroup, p = 4, k = {
  start: "bottom-start",
  center: "bottom",
  end: "bottom-end"
}, h = f(), L = (n) => {
  const [e, t] = u("start"), [s, m] = u(p);
  return o(h.Provider, {
    value: {
      setAlign: t,
      setSideOffset: m
    },
    get children() {
      return o(r, l({
        get placement() {
          return k[e()];
        },
        get gutter() {
          return s();
        }
      }, n));
    }
  });
}, B = (n) => {
  const [e, t] = d(n, ["class", "children", "align", "sideOffset"]), s = x(h);
  return w(() => {
    s?.setAlign(e.align ?? "start"), s?.setSideOffset(e.sideOffset ?? p);
  }), o(r.Portal, {
    get children() {
      return o(r.Content, l(t, {
        get class() {
          return c("zen-z-50 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md", e.class);
        },
        get children() {
          return e.children;
        }
      }));
    }
  });
}, j = (n) => {
  const [e, t] = d(n, ["class", "inset", "children"]);
  return o(r.SubTrigger, l(t, {
    get class() {
      return c("zen-flex zen-cursor-default zen-items-center zen-gap-2 zen-select-none zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none", "data-[expanded]:zen-bg-zen-muted data-[highlighted]:zen-bg-zen-muted", e.inset && "zen-pl-8", e.class);
    },
    get children() {
      return [i(() => e.children), o(y, {})];
    }
  }));
}, F = (n) => {
  const [e, t] = d(n, ["class", "children"]);
  return o(r.Portal, {
    get children() {
      return o(r.SubContent, l(t, {
        get class() {
          return c("zen-z-50 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md", e.class);
        },
        get children() {
          return e.children;
        }
      }));
    }
  });
}, N = (n) => {
  const [e, t] = d(n, ["class", "inset", "variant", "disabled", "onSelect", "children"]);
  return o(r.Item, l(t, {
    get disabled() {
      return e.disabled;
    },
    get onSelect() {
      return e.onSelect;
    },
    get class() {
      return c("zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none", "data-[highlighted]:zen-bg-zen-muted", "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50", e.variant === "destructive" && "zen-text-zen-error data-[highlighted]:zen-bg-zen-error-soft data-[highlighted]:zen-text-zen-error-soft-fg", e.inset && "zen-pl-8", e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, U = (n) => {
  const [e, t] = d(n, ["class", "checked", "onChange", "disabled", "children"]);
  return o(r.CheckboxItem, l(t, {
    get checked() {
      return e.checked;
    },
    get onChange() {
      return e.onChange;
    },
    get disabled() {
      return e.disabled;
    },
    get class() {
      return c("zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none", "data-[highlighted]:zen-bg-zen-muted", "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50", e.class);
    },
    get children() {
      return [(() => {
        var s = g();
        return z(s, o(r.ItemIndicator, {
          get children() {
            return o(S, {});
          }
        })), s;
      })(), i(() => e.children)];
    }
  }));
}, Y = (n) => {
  const [e, t] = d(n, ["class", "value", "disabled", "children"]);
  return o(r.RadioItem, l(t, {
    get value() {
      return e.value;
    },
    get disabled() {
      return e.disabled;
    },
    get class() {
      return c("zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none", "data-[highlighted]:zen-bg-zen-muted", "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50", e.class);
    },
    get children() {
      return [(() => {
        var s = g();
        return z(s, o(r.ItemIndicator, {
          get children() {
            return o(I, {});
          }
        })), s;
      })(), i(() => e.children)];
    }
  }));
}, q = (n) => {
  const [e, t] = d(n, ["class", "inset", "children"]);
  return o(r.GroupLabel, l(t, {
    get class() {
      return c("zen-px-2 zen-py-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg", e.inset && "zen-pl-8", e.class);
    },
    get children() {
      return e.children;
    }
  }));
}, H = (n) => {
  const [e, t] = d(n, ["class"]);
  return o(r.Separator, l(t, {
    get class() {
      return c("-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border", e.class);
    }
  }));
}, J = (n) => {
  const [e, t] = d(n, ["class", "children"]);
  return (() => {
    var s = v();
    return b(s, l(t, {
      get class() {
        return c("zen-ml-auto zen-text-xs zen-tracking-widest zen-text-zen-muted-fg", e.class);
      }
    }), !1, !0), z(s, () => e.children), s;
  })();
}, S = () => D(), I = () => C(), y = () => M();
export {
  L as DropdownMenu,
  U as DropdownMenuCheckboxItem,
  B as DropdownMenuContent,
  G as DropdownMenuGroup,
  N as DropdownMenuItem,
  q as DropdownMenuLabel,
  O as DropdownMenuPortal,
  A as DropdownMenuRadioGroup,
  Y as DropdownMenuRadioItem,
  H as DropdownMenuSeparator,
  J as DropdownMenuShortcut,
  R as DropdownMenuSub,
  F as DropdownMenuSubContent,
  j as DropdownMenuSubTrigger,
  E as DropdownMenuTrigger
};
//# sourceMappingURL=index57.js.map
