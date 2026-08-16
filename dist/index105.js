import { jsx as n, jsxs as p } from "react/jsx-runtime";
import * as u from "react";
import { Button as x } from "./index65.js";
import { Icon as g } from "./index57.js";
import { Progress as k } from "./index60.js";
import { cn as d } from "./index145.js";
const B = (e) => e < 1024 ? `${e} B` : e < 1024 * 1024 ? `${(e / 1024).toFixed(1)} KB` : `${(e / 1024 / 1024).toFixed(1)} MB`, b = (e) => {
  const r = e.status ?? "complete";
  return [
    r === "pending" ? "Queued" : r === "uploading" && e.progress === void 0 ? "Uploading…" : void 0,
    e.size !== void 0 ? B(e.size) : void 0,
    e.uploadedAt,
    e.uploadedBy
  ].filter(Boolean).join(" · ");
}, y = ({ item: e, disabled: r, onRemove: l, onRetry: c, onRename: i }) => {
  const [z, o] = u.useState(!1), t = u.useRef(null), f = u.useRef(!1), s = e.status ?? "complete", h = s === "uploading" || s === "pending";
  u.useEffect(() => {
    z && (t.current?.focus(), t.current?.select());
  }, [z]);
  const v = () => {
    if (f.current) {
      f.current = !1;
      return;
    }
    const a = t.current;
    if (!a) return;
    const m = a.value.trim();
    o(!1), m && m !== e.name && i?.(e, m);
  }, N = () => {
    f.current = !0, o(!1);
  };
  return /* @__PURE__ */ p(
    "li",
    {
      className: d(
        "zen-flex zen-items-start zen-gap-3 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2",
        s === "error" && "zen-border-zen-error/40"
      ),
      children: [
        e.thumbnail ? (
          /* Decorative: the file's name is right beside it, so alt text would be
             the same words read twice. */
          /* @__PURE__ */ n(
            "img",
            {
              src: e.thumbnail,
              alt: "",
              className: "zen-mt-0.5 zen-h-9 zen-w-9 zen-shrink-0 zen-rounded-zen-sm zen-object-cover"
            }
          )
        ) : /* @__PURE__ */ n(
          "span",
          {
            "aria-hidden": "true",
            className: d(
              "zen-mt-0.5 zen-shrink-0",
              s === "error" ? "zen-text-zen-error" : "zen-text-zen-muted-fg"
            ),
            children: /* @__PURE__ */ n(g, { name: s === "error" ? "x-circle" : "file", size: 18 })
          }
        ),
        /* @__PURE__ */ p("div", { className: "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-1", children: [
          z ? (
            /* Escape cancels, Enter and blur commit — the three things anyone
                         tries. Committing on blur rather than demanding Enter means a click
                         elsewhere does not silently discard the edit.
            
                         Uncontrolled (defaultValue): the value is read once on commit, so
                         binding it to state would re-render the row on every keystroke to
                         no end. */
            /* @__PURE__ */ n(
              "input",
              {
                ref: t,
                defaultValue: e.name,
                "aria-label": `Rename ${e.name}`,
                className: "zen-w-full zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1 zen-text-sm focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                onKeyDown: (a) => {
                  a.key === "Enter" ? (a.preventDefault(), v()) : a.key === "Escape" && (a.preventDefault(), N());
                },
                onBlur: v
              }
            )
          ) : e.url ? /* @__PURE__ */ n(
            "a",
            {
              href: e.url,
              className: "zen-truncate zen-text-sm zen-font-medium zen-text-zen-primary hover:zen-underline",
              children: e.name
            }
          ) : /* @__PURE__ */ n("span", { className: "zen-truncate zen-text-sm zen-font-medium", children: e.name }),
          s === "error" ? /* @__PURE__ */ n("span", { className: "zen-text-xs zen-text-zen-error", children: e.error ?? "Upload failed" }) : !!b(e) && /* @__PURE__ */ n("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: b(e) }),
          h && e.progress !== void 0 && /* @__PURE__ */ n(k, { size: "sm", value: e.progress, "aria-label": `Uploading ${e.name}` })
        ] }),
        /* @__PURE__ */ p("div", { className: "zen-flex zen-shrink-0 zen-items-center zen-gap-1", children: [
          s === "error" && c && /* A word, not an icon. There is no retry glyph anyone reads reliably,
          and this is the one action a failed row exists to offer. */
          /* @__PURE__ */ n(x, { variant: "outline", size: "sm", disabled: r, onClick: () => c(e), children: "Retry" }),
          i && !h && /* @__PURE__ */ n(
            x,
            {
              variant: "ghost",
              color: "neutral",
              size: "sm",
              "aria-label": `Rename ${e.name}`,
              disabled: r,
              onClick: () => o(!0),
              children: /* @__PURE__ */ n(g, { name: "edit", size: 14 })
            }
          ),
          l && /* @__PURE__ */ n(
            x,
            {
              variant: "ghost",
              color: "neutral",
              size: "sm",
              "aria-label": `Remove ${e.name}`,
              disabled: r,
              onClick: () => l(e),
              children: /* @__PURE__ */ n(g, { name: "trash", size: 14 })
            }
          )
        ] })
      ]
    }
  );
}, E = ({
  items: e,
  onRemove: r,
  onRetry: l,
  onRename: c,
  emptyMessage: i,
  disabled: z,
  className: o
}) => (e ?? []).length === 0 ? /* @__PURE__ */ n(
  "p",
  {
    className: d(
      "zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg",
      o
    ),
    children: i ?? "No files yet"
  }
) : /* @__PURE__ */ n("ul", { className: d("zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0", o), children: e.map((t) => /* @__PURE__ */ n(
  y,
  {
    item: t,
    disabled: z,
    onRemove: r,
    onRetry: l,
    onRename: c
  },
  t.id
)) });
export {
  E as UploadCollection
};
//# sourceMappingURL=index105.js.map
