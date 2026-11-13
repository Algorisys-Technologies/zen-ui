import { jsxs as o, jsx as e, Fragment as q } from "react/jsx-runtime";
import * as d from "react";
import { flushSync as ae } from "react-dom";
import { isViewModified as te, encodeView as re, freeViewName as ie, viewNameProblem as E } from "./index218.js";
import { Button as C } from "./index71.js";
import { Input as K } from "./index4.js";
import { Checkbox as le } from "./index36.js";
import { Icon as G } from "./index63.js";
import { Dialog as B, DialogContent as H, DialogHeader as Q, DialogTitle as Y, DialogDescription as J, DialogFooter as U } from "./index79.js";
import { DropdownMenu as oe, DropdownMenuTrigger as se, DropdownMenuContent as de, DropdownMenuLabel as ce, DropdownMenuRadioGroup as me, DropdownMenuRadioItem as L, DropdownMenuSeparator as P, DropdownMenuItem as x } from "./index73.js";
import { useLocale as S } from "./index90.js";
import { cn as ue } from "./index197.js";
const D = "__zen_standard_view__";
let ze = 0;
const ge = () => `view-${Date.now().toString(36)}-${(++ze).toString(36)}`, F = (n) => String(n?.message ?? n);
function Ae({
  views: n,
  activeId: t,
  state: c,
  standardState: g,
  standardName: p,
  onSelect: v,
  onSave: f,
  onCreate: h,
  onRename: w,
  onDelete: b,
  onDefaultChange: z,
  onShare: a,
  "aria-label": s,
  className: m
}) {
  const i = S(), l = n.find((r) => r.id === t) ?? null, u = p ?? i.t("viewManager.standard"), N = l?.name ?? u, A = d.useMemo(() => te(c, l, g), [c, l, g]), R = !n.some((r) => r.isDefault), X = l ? !!l.isDefault : R, [V, T] = d.useState(!1), [$, O] = d.useState(!1), [Z, I] = d.useState(""), _ = d.useRef(null), y = (r) => {
    ae(() => I("")), I(r);
  }, ee = async () => {
    const r = l;
    if (!(!r || r.readOnly || !f))
      try {
        await f({ ...r, state: c }), y(i.t("viewManager.saved", { name: r.name }));
      } catch (M) {
        y(i.t("viewManager.saveFailed", { name: r.name, error: F(M) }));
      }
  }, ne = async (r, M) => {
    const k = { id: ge(), name: r.trim(), state: c };
    await h(k), M && await z?.(k.id), y(i.t("viewManager.saved", { name: k.name }));
  }, W = (r) => {
    r.preventDefault(), _.current?.focus();
  };
  return /* @__PURE__ */ o("div", { className: ue("zen-inline-flex zen-items-center", m), children: [
    /* @__PURE__ */ o(oe, { children: [
      /* @__PURE__ */ o(
        se,
        {
          ref: _,
          "aria-label": i.t(A ? "viewManager.triggerModified" : "viewManager.trigger", {
            label: s ?? i.t("viewManager.label"),
            name: N
          }),
          className: "zen-inline-flex zen-cursor-pointer zen-items-center zen-gap-1.5 zen-rounded-zen-md zen-border-0 zen-bg-transparent zen-px-1.5 zen-py-1 zen-text-zen-foreground hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          children: [
            /* @__PURE__ */ e("span", { className: "zen-text-lg zen-font-semibold", "data-view-name": "", children: N }),
            A && /* @__PURE__ */ e("span", { className: "zen-rounded-zen-sm zen-bg-zen-muted zen-px-1.5 zen-py-0.5 zen-text-xs zen-font-medium zen-text-zen-muted-fg", "data-view-modified": "", children: i.t("viewManager.modified") }),
            /* @__PURE__ */ e(G, { name: "chevron-down", size: 16, className: "zen-text-zen-muted-fg" })
          ]
        }
      ),
      /* @__PURE__ */ o(de, { className: "zen-min-w-64", children: [
        /* @__PURE__ */ e(ce, { children: i.t("viewManager.views") }),
        /* @__PURE__ */ o(
          me,
          {
            value: t ?? D,
            onValueChange: (r) => {
              r !== (t ?? D) && v(r === D ? null : n.find((M) => M.id === r) ?? null);
            },
            children: [
              /* @__PURE__ */ e(L, { value: D, closeOnSelect: !0, children: /* @__PURE__ */ e(j, { name: u, isDefault: R }) }),
              n.map((r) => /* @__PURE__ */ e(L, { value: r.id, closeOnSelect: !0, children: /* @__PURE__ */ e(j, { name: r.name, isDefault: !!r.isDefault, shared: !!r.shared }) }, r.id))
            ]
          }
        ),
        /* @__PURE__ */ e(P, {}),
        f && /* @__PURE__ */ e(x, { disabled: !l || !!l.readOnly || !A, onSelect: () => {
          ee();
        }, children: i.t("viewManager.save") }),
        h && /* @__PURE__ */ e(x, { onSelect: () => T(!0), children: i.t("viewManager.saveAs") }),
        z && /* @__PURE__ */ e(x, { disabled: X, onSelect: () => {
          z(l?.id ?? null);
        }, children: l ? i.t("viewManager.openWithThis") : i.t("viewManager.openWith", { name: u }) }),
        a && /* @__PURE__ */ e(
          x,
          {
            onSelect: () => {
              const r = l ?? { id: D, name: u, state: c };
              a({ ...r, state: c }, re({ name: r.name, state: c })), y(i.t("viewManager.linkCopied", { name: r.name }));
            },
            children: i.t("viewManager.copyLink")
          }
        ),
        (w || b || z) && /* @__PURE__ */ o(q, { children: [
          /* @__PURE__ */ e(P, {}),
          /* @__PURE__ */ e(x, { disabled: n.length === 0, onSelect: () => O(!0), children: i.t("viewManager.manage") })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e("span", { className: "zen-sr-only", role: "status", children: Z }),
    /* @__PURE__ */ e(B, { open: V, onOpenChange: T, children: V && /* @__PURE__ */ e(
      fe,
      {
        onClose: () => T(!1),
        onCloseAutoFocus: W,
        views: n,
        suggested: ie(l?.name ?? i.t("viewManager.newView"), n),
        canDefault: !!z,
        onSave: ne
      }
    ) }),
    /* @__PURE__ */ e(B, { open: $, onOpenChange: O, children: $ && /* @__PURE__ */ e(
      he,
      {
        onClose: () => O(!1),
        onCloseAutoFocus: W,
        views: n,
        standardName: u,
        onRename: w,
        onDelete: b,
        onDefaultChange: z
      }
    ) })
  ] });
}
const j = (n) => {
  const t = S();
  return /* @__PURE__ */ o("span", { className: "zen-flex zen-w-full zen-items-center zen-gap-2", children: [
    /* @__PURE__ */ e("span", { className: "zen-min-w-0 zen-flex-1 zen-truncate", children: n.name }),
    n.shared && /* @__PURE__ */ e("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: t.t("viewManager.shared") }),
    n.isDefault && /* @__PURE__ */ e("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: t.t("viewManager.default") })
  ] });
}, fe = (n) => {
  const t = S(), c = d.useId(), [g, p] = d.useState(n.suggested), [v, f] = d.useState(!1), [h, w] = d.useState(!1), [b, z] = d.useState(!1), [a, s] = d.useState(""), m = E(g, n.views), i = async () => {
    if (w(!0), !(m || b)) {
      z(!0), s("");
      try {
        await n.onSave(g, v), n.onClose();
      } catch (l) {
        s(t.t("viewManager.notSaved", { error: F(l) })), z(!1);
      }
    }
  };
  return /* @__PURE__ */ o(H, { className: "zen-max-w-md", onCloseAutoFocus: n.onCloseAutoFocus, children: [
    /* @__PURE__ */ o(Q, { children: [
      /* @__PURE__ */ e(Y, { children: t.t("viewManager.saveAsTitle") }),
      /* @__PURE__ */ e(J, { children: t.t("viewManager.saveAsDescription") })
    ] }),
    /* @__PURE__ */ o(
      "form",
      {
        className: "zen-flex zen-flex-col zen-gap-3",
        onSubmit: (l) => {
          l.preventDefault(), i();
        },
        children: [
          /* @__PURE__ */ o("div", { className: "zen-flex zen-flex-col zen-gap-1.5", children: [
            /* @__PURE__ */ e("label", { htmlFor: `${c}-name`, className: "zen-text-sm zen-font-medium", children: t.t("viewManager.name") }),
            /* @__PURE__ */ e(
              K,
              {
                id: `${c}-name`,
                value: g,
                onChange: (l) => p(l.currentTarget.value),
                "aria-invalid": h && m ? "true" : void 0,
                "aria-describedby": `${c}-problem`
              }
            ),
            /* @__PURE__ */ e("p", { id: `${c}-problem`, className: "zen-m-0 zen-min-h-5 zen-text-sm zen-text-zen-error", "aria-live": "polite", children: h && m || a })
          ] }),
          n.canDefault && /* @__PURE__ */ o("label", { className: "zen-inline-flex zen-items-center zen-gap-2 zen-self-start", children: [
            /* @__PURE__ */ e(le, { checked: v, onCheckedChange: (l) => f(l === !0) }),
            /* @__PURE__ */ e("span", { className: "zen-text-sm", children: t.t("viewManager.openByDefault") })
          ] }),
          /* @__PURE__ */ o(U, { children: [
            /* @__PURE__ */ e(C, { type: "button", variant: "outline", color: "neutral", onClick: n.onClose, children: t.t("common.cancel") }),
            /* @__PURE__ */ e(C, { type: "submit", loading: b, children: t.t("viewManager.save") })
          ] })
        ]
      }
    )
  ] });
}, he = (n) => {
  const t = S(), c = d.useId(), [g, p] = d.useState({}), [v, f] = d.useState(null), h = d.useRef(null), w = d.useRef(n.views);
  w.current = n.views;
  const b = async (a) => {
    f(null), await n.onDelete?.(a), h.current?.focus();
  }, z = async (a, s, m) => {
    const i = w.current.find((u) => u.id === a);
    if (!i || s.trim() === i.name) return;
    const l = E(s, w.current, i.id);
    if (l) {
      p((u) => ({ ...u, [i.id]: l }));
      return;
    }
    try {
      await n.onRename?.(i.id, s.trim()), p((u) => ({ ...u, [i.id]: "" }));
    } catch (u) {
      p((N) => ({ ...N, [i.id]: t.t("viewManager.notRenamed", { error: F(u) }) })), m.value = i.name;
    }
  };
  return /* @__PURE__ */ o(
    H,
    {
      className: "zen-max-w-lg",
      onCloseAutoFocus: n.onCloseAutoFocus,
      onEscapeKeyDown: (a) => {
        v !== null && (a.preventDefault(), f(null));
      },
      children: [
        /* @__PURE__ */ o(Q, { children: [
          /* @__PURE__ */ e(Y, { children: t.t("viewManager.manageTitle") }),
          /* @__PURE__ */ e(J, { children: t.t("viewManager.manageDescription") })
        ] }),
        /* @__PURE__ */ o("table", { className: "zen-w-full zen-border-collapse zen-text-sm", children: [
          /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ o("tr", { className: "zen-text-xs zen-text-zen-muted-fg", children: [
            /* @__PURE__ */ e("th", { className: "zen-py-1.5 zen-text-start zen-font-medium", children: t.t("viewManager.name") }),
            n.onDefaultChange && /* @__PURE__ */ e("th", { className: "zen-w-20 zen-py-1.5 zen-text-center zen-font-medium", children: t.t("viewManager.default") }),
            n.onDelete && /* @__PURE__ */ e("th", { className: "zen-w-12 zen-py-1.5", children: /* @__PURE__ */ e("span", { className: "zen-sr-only", children: t.t("common.delete") }) })
          ] }) }),
          /* @__PURE__ */ o("tbody", { children: [
            n.onDefaultChange && /* @__PURE__ */ o("tr", { className: "zen-border-0 zen-border-t zen-border-solid zen-border-zen-border", children: [
              /* @__PURE__ */ e("td", { className: "zen-py-1.5 zen-text-zen-muted-fg", children: n.standardName }),
              /* @__PURE__ */ e("td", { className: "zen-py-1.5 zen-text-center", children: /* @__PURE__ */ e(
                "input",
                {
                  type: "radio",
                  name: `${c}-default`,
                  "aria-label": t.t("viewManager.openWith", { name: n.standardName }),
                  checked: !n.views.some((a) => a.isDefault),
                  onChange: () => {
                    n.onDefaultChange?.(null);
                  }
                }
              ) }),
              n.onDelete && /* @__PURE__ */ e("td", {})
            ] }),
            n.views.map((a) => {
              const s = v === a.id;
              return /* @__PURE__ */ o("tr", { className: "zen-border-0 zen-border-t zen-border-solid zen-border-zen-border", "data-view-row": a.id, children: [
                /* @__PURE__ */ e("td", { className: "zen-py-1.5 zen-pe-3", children: !a.readOnly && n.onRename ? /* @__PURE__ */ o(q, { children: [
                  /* @__PURE__ */ e(
                    K,
                    {
                      defaultValue: a.name,
                      "aria-label": t.t("viewManager.nameOf", { name: a.name }),
                      "aria-invalid": g[a.id] ? "true" : void 0,
                      onKeyDown: (m) => {
                        m.key === "Enter" && (m.preventDefault(), z(a.id, m.currentTarget.value, m.currentTarget));
                      },
                      onBlur: (m) => {
                        z(a.id, m.currentTarget.value, m.currentTarget);
                      }
                    }
                  ),
                  g[a.id] && /* @__PURE__ */ e("p", { className: "zen-m-0 zen-mt-1 zen-text-xs zen-text-zen-error", role: "alert", children: g[a.id] })
                ] }) : /* @__PURE__ */ o("span", { children: [
                  a.name,
                  " ",
                  /* @__PURE__ */ e("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: a.shared ? t.t("viewManager.sharedWithYou") : t.t("viewManager.readOnly") })
                ] }) }),
                n.onDefaultChange && /* @__PURE__ */ e("td", { className: "zen-py-1.5 zen-text-center", children: /* @__PURE__ */ e(
                  "input",
                  {
                    type: "radio",
                    name: `${c}-default`,
                    "aria-label": t.t("viewManager.openWithQuoted", { name: a.name }),
                    checked: !!a.isDefault,
                    onChange: () => {
                      n.onDefaultChange?.(a.id);
                    }
                  }
                ) }),
                n.onDelete && /* @__PURE__ */ e("td", { className: "zen-py-1.5 zen-text-end", children: !a.readOnly && // One button that changes in place: swapping in a separate confirm
                // button removes the focused element, the dialog's focus trap moves
                // focus, and the blur cancels the confirmation it had just asked for.
                /* @__PURE__ */ e(
                  C,
                  {
                    variant: s ? "soft" : "ghost",
                    color: s ? "error" : "neutral",
                    shape: s ? void 0 : "square",
                    size: "sm",
                    "aria-label": s ? t.t("viewManager.confirmDelete", { name: a.name }) : t.t("viewManager.deleteView", { name: a.name }),
                    title: s ? t.t("viewManager.pressAgain") : t.t("common.delete"),
                    onBlur: () => f(null),
                    onClick: () => s ? void b(a.id) : f(a.id),
                    children: s ? t.t("common.delete") : /* @__PURE__ */ e(G, { name: "trash", size: 16 })
                  }
                ) })
              ] }, a.id);
            })
          ] })
        ] }),
        /* @__PURE__ */ e(U, { children: /* @__PURE__ */ e(C, { ref: h, type: "button", onClick: n.onClose, children: t.t("common.done") }) })
      ]
    }
  );
};
export {
  Ae as ViewManager
};
//# sourceMappingURL=index50.js.map
