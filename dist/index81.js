import { jsxs as l, jsx as n, Fragment as H } from "react/jsx-runtime";
import * as m from "react";
import { Button as O } from "./index71.js";
import { useLocale as E } from "./index90.js";
import { cn as L } from "./index197.js";
const N = (t) => t < 1024 ? `${t} B` : t < 1024 * 1024 ? `${(t / 1024).toFixed(1)} KB` : `${(t / 1024 / 1024).toFixed(1)} MB`, K = (t, p) => p ? p.split(",").map((r) => r.trim()).filter(Boolean).some((r) => {
  if (r.startsWith("."))
    return t.name.toLowerCase().endsWith(r.toLowerCase());
  if (r.endsWith("/*")) {
    const c = r.slice(0, -1);
    return t.type.startsWith(c);
  }
  return t.type === r;
}) : !0, P = m.forwardRef(
  ({
    value: t,
    defaultValue: p,
    onValueChange: v,
    onError: r,
    maxSize: c,
    maxFiles: B,
    multiple: h = !1,
    disabled: o,
    label: D,
    helperText: w,
    showFileList: I = !0,
    accept: F,
    className: C,
    ...W
  }, M) => {
    const i = E(), [$, U] = m.useState(p ?? []), y = t !== void 0, x = y ? t : $, g = m.useRef(null);
    m.useImperativeHandle(M, () => g.current);
    const [A, k] = m.useState(!1), d = B ?? (h ? 1 / 0 : 1), b = (e) => {
      const f = Array.from(e), s = [], u = [];
      for (const a of f) {
        if (typeof c == "number" && a.size > c) {
          s.push({
            file: a,
            reason: "size",
            message: i.t("fileUpload.rejectSize", { name: a.name, size: N(c) })
          });
          continue;
        }
        if (!K(a, F)) {
          s.push({
            file: a,
            reason: "type",
            message: i.t("fileUpload.rejectType", { name: a.name })
          });
          continue;
        }
        u.push(a);
      }
      let z = h ? [...x, ...u] : u.slice(0, 1);
      z.length > d && (z.slice(d).forEach(
        (j) => s.push({
          file: j,
          reason: "max-files",
          message: i.t("fileUpload.rejectMaxFiles", { max: d, name: j.name })
        })
      ), z = z.slice(0, d)), s.length > 0 && r?.(s), y || U(z), v?.(z);
    }, R = (e) => {
      const f = x.filter((s, u) => u !== e);
      y || U(f), v?.(f);
    }, T = (e) => {
      e.preventDefault(), k(!1), !o && e.dataTransfer.files?.length && b(e.dataTransfer.files);
    };
    return /* @__PURE__ */ l("div", { className: L("zen-flex zen-flex-col zen-gap-2", C), children: [
      /* @__PURE__ */ l(
        "div",
        {
          onDragOver: (e) => {
            e.preventDefault(), o || k(!0);
          },
          onDragLeave: () => k(!1),
          onDrop: T,
          onClick: () => !o && g.current?.click(),
          role: "button",
          tabIndex: o ? -1 : 0,
          "aria-disabled": o || void 0,
          onKeyDown: (e) => {
            o || (e.key === "Enter" || e.key === " ") && (e.preventDefault(), g.current?.click());
          },
          className: L(
            "zen-rounded-zen-md zen-border-2 zen-border-dashed zen-p-6 zen-text-center zen-transition-colors zen-cursor-pointer",
            "zen-flex zen-flex-col zen-items-center zen-justify-center zen-gap-2",
            A ? "zen-border-zen-primary zen-bg-zen-primary-soft" : "zen-border-zen-border zen-bg-zen-muted/30",
            "hover:zen-bg-zen-muted/60",
            o && "zen-opacity-50 zen-cursor-not-allowed zen-pointer-events-none",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2"
          ),
          children: [
            /* @__PURE__ */ n(X, {}),
            /* @__PURE__ */ n("div", { className: "zen-text-sm", children: D ?? /* @__PURE__ */ l(H, { children: [
              /* @__PURE__ */ n("span", { className: "zen-font-medium", children: i.t("fileUpload.clickToUpload") }),
              " ",
              /* @__PURE__ */ n("span", { className: "zen-text-zen-muted-fg", children: i.t("fileUpload.orDragAndDrop") })
            ] }) }),
            w ? /* @__PURE__ */ n("div", { className: "zen-text-xs zen-text-zen-muted-fg", children: w }) : c ? /* @__PURE__ */ n("div", { className: "zen-text-xs zen-text-zen-muted-fg", children: i.t("fileUpload.maxPerFile", {
              size: N(c),
              suffix: h && d !== 1 / 0 ? i.t("fileUpload.upToFiles", { max: d }) : ""
            }) }) : null,
            /* @__PURE__ */ n(
              "input",
              {
                ref: g,
                type: "file",
                accept: F,
                multiple: h,
                disabled: o,
                onChange: (e) => {
                  e.target.files?.length && b(e.target.files), e.target.value = "";
                },
                className: "zen-sr-only",
                ...W
              }
            )
          ]
        }
      ),
      I && x.length > 0 ? /* @__PURE__ */ n("ul", { className: "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-1 zen-p-0 zen-text-sm", children: x.map((e, f) => /* @__PURE__ */ l(
        "li",
        {
          className: "zen-flex zen-items-center zen-gap-3 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2",
          children: [
            /* @__PURE__ */ n(_, {}),
            /* @__PURE__ */ l("div", { className: "zen-flex zen-flex-col zen-min-w-0 zen-flex-1", children: [
              /* @__PURE__ */ n("span", { className: "zen-truncate zen-font-medium", children: e.name }),
              /* @__PURE__ */ n("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: N(e.size) })
            ] }),
            /* @__PURE__ */ n(
              O,
              {
                variant: "ghost",
                color: "neutral",
                size: "sm",
                "aria-label": i.t("fileUpload.removeFile", { name: e.name }),
                onClick: (s) => {
                  s.stopPropagation(), R(f);
                },
                disabled: o,
                children: /* @__PURE__ */ n(q, {})
              }
            )
          ]
        },
        `${e.name}-${f}`
      )) }) : null
    ] });
  }
);
P.displayName = "FileUpload";
const X = () => /* @__PURE__ */ l("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, className: "zen-text-zen-muted-fg", children: [
  /* @__PURE__ */ n("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
  /* @__PURE__ */ n("polyline", { points: "17 8 12 3 7 8" }),
  /* @__PURE__ */ n("line", { x1: "12", y1: "3", x2: "12", y2: "15" })
] }), _ = () => /* @__PURE__ */ l("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, className: "zen-text-zen-muted-fg zen-shrink-0", children: [
  /* @__PURE__ */ n("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
  /* @__PURE__ */ n("polyline", { points: "14 2 14 8 20 8" })
] }), q = () => /* @__PURE__ */ l("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
  /* @__PURE__ */ n("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ n("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] });
export {
  P as FileUpload
};
//# sourceMappingURL=index81.js.map
