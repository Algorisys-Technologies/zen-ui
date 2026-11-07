import { jsx as n, jsxs as g } from "react/jsx-runtime";
import * as d from "react";
import { Button as x } from "./index71.js";
import { Icon as h } from "./index63.js";
import { Progress as B } from "./index66.js";
import { useLocale as N } from "./index90.js";
import { cn as p } from "./index160.js";
const y = (e) => e < 1024 ? `${e} B` : e < 1024 * 1024 ? `${(e / 1024).toFixed(1)} KB` : `${(e / 1024 / 1024).toFixed(1)} MB`, C = (e, o) => {
  const t = e.status ?? "complete";
  return [
    t === "pending" ? o("uploadCollection.queued") : t === "uploading" && e.progress === void 0 ? o("uploadCollection.uploadingNoProgress") : void 0,
    e.size !== void 0 ? y(e.size) : void 0,
    e.uploadedAt,
    e.uploadedBy
  ].filter(Boolean).join(" · ");
}, w = ({ item: e, disabled: o, onRemove: t, onRetry: i, onRename: u }) => {
  const r = N(), [c, z] = d.useState(!1), l = d.useRef(null), f = d.useRef(!1), a = e.status ?? "complete", v = a === "uploading" || a === "pending";
  d.useEffect(() => {
    c && (l.current?.focus(), l.current?.select());
  }, [c]);
  const b = () => {
    if (f.current) {
      f.current = !1;
      return;
    }
    const s = l.current;
    if (!s) return;
    const m = s.value.trim();
    z(!1), m && m !== e.name && u?.(e, m);
  }, k = () => {
    f.current = !0, z(!1);
  };
  return /* @__PURE__ */ g(
    "li",
    {
      className: p(
        "zen-flex zen-items-start zen-gap-3 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2",
        a === "error" && "zen-border-zen-error/40"
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
            className: p(
              "zen-mt-0.5 zen-shrink-0",
              a === "error" ? "zen-text-zen-error" : "zen-text-zen-muted-fg"
            ),
            children: /* @__PURE__ */ n(h, { name: a === "error" ? "x-circle" : "file", size: 18 })
          }
        ),
        /* @__PURE__ */ g("div", { className: "zen-flex zen-min-w-0 zen-flex-1 zen-flex-col zen-gap-1", children: [
          c ? (
            /* Escape cancels, Enter and blur commit — the three things anyone
                         tries. Committing on blur rather than demanding Enter means a click
                         elsewhere does not silently discard the edit.
            
                         Uncontrolled (defaultValue): the value is read once on commit, so
                         binding it to state would re-render the row on every keystroke to
                         no end. */
            /* @__PURE__ */ n(
              "input",
              {
                ref: l,
                defaultValue: e.name,
                "aria-label": r.t("uploadCollection.rename", { name: e.name }),
                className: "zen-w-full zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1 zen-text-sm focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                onKeyDown: (s) => {
                  s.key === "Enter" ? (s.preventDefault(), b()) : s.key === "Escape" && (s.preventDefault(), k());
                },
                onBlur: b
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
          a === "error" ? /* @__PURE__ */ n("span", { className: "zen-text-xs zen-text-zen-error", children: e.error ?? r.t("uploadCollection.uploadFailed") }) : !!C(e, r.t) && /* @__PURE__ */ n("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: C(e, r.t) }),
          v && e.progress !== void 0 && /* @__PURE__ */ n(B, { size: "sm", value: e.progress, "aria-label": r.t("uploadCollection.uploading", { name: e.name }) })
        ] }),
        /* @__PURE__ */ g("div", { className: "zen-flex zen-shrink-0 zen-items-center zen-gap-1", children: [
          a === "error" && i && /* A word, not an icon. There is no retry glyph anyone reads reliably,
          and this is the one action a failed row exists to offer. */
          /* @__PURE__ */ n(x, { variant: "outline", size: "sm", disabled: o, onClick: () => i(e), children: r.t("uploadCollection.retry") }),
          u && !v && /* @__PURE__ */ n(
            x,
            {
              variant: "ghost",
              color: "neutral",
              size: "sm",
              "aria-label": r.t("uploadCollection.rename", { name: e.name }),
              disabled: o,
              onClick: () => z(!0),
              children: /* @__PURE__ */ n(h, { name: "edit", size: 14 })
            }
          ),
          t && /* @__PURE__ */ n(
            x,
            {
              variant: "ghost",
              color: "neutral",
              size: "sm",
              "aria-label": r.t("uploadCollection.remove", { name: e.name }),
              disabled: o,
              onClick: () => t(e),
              children: /* @__PURE__ */ n(h, { name: "trash", size: 14 })
            }
          )
        ] })
      ]
    }
  );
}, P = ({
  items: e,
  onRemove: o,
  onRetry: t,
  onRename: i,
  emptyMessage: u,
  disabled: r,
  className: c
}) => {
  const z = N();
  return (e ?? []).length === 0 ? /* @__PURE__ */ n(
    "p",
    {
      className: p(
        "zen-m-0 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg",
        c
      ),
      children: u ?? z.t("uploadCollection.noFilesYet")
    }
  ) : /* @__PURE__ */ n("ul", { className: p("zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0", c), children: e.map((l) => /* @__PURE__ */ n(
    w,
    {
      item: l,
      disabled: r,
      onRemove: o,
      onRetry: t,
      onRename: i
    },
    l.id
  )) });
};
export {
  P as UploadCollection
};
//# sourceMappingURL=index115.js.map
