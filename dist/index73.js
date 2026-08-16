import { jsxs as s, jsx as n, Fragment as O } from "react/jsx-runtime";
import * as u from "react";
import { Button as U } from "./index65.js";
import { cn as C } from "./index145.js";
const k = (t) => t < 1024 ? `${t} B` : t < 1024 * 1024 ? `${(t / 1024).toFixed(1)} KB` : `${(t / 1024 / 1024).toFixed(1)} MB`, E = (t, m) => m ? m.split(",").map((r) => r.trim()).filter(Boolean).some((r) => {
  if (r.startsWith("."))
    return t.name.toLowerCase().endsWith(r.toLowerCase());
  if (r.endsWith("/*")) {
    const l = r.slice(0, -1);
    return t.type.startsWith(l);
  }
  return t.type === r;
}) : !0, K = u.forwardRef(
  ({
    value: t,
    defaultValue: m,
    onValueChange: g,
    onError: r,
    maxSize: l,
    maxFiles: I,
    multiple: p = !1,
    disabled: o,
    label: L,
    helperText: N,
    showFileList: F = !0,
    accept: w,
    className: j,
    ...D
  }, W) => {
    const [M, $] = u.useState(m ?? []), v = t !== void 0, h = v ? t : M, x = u.useRef(null);
    u.useImperativeHandle(W, () => x.current);
    const [R, y] = u.useState(!1), f = I ?? (p ? 1 / 0 : 1), b = (e) => {
      const c = Array.from(e), i = [], z = [];
      for (const a of c) {
        if (typeof l == "number" && a.size > l) {
          i.push({
            file: a,
            reason: "size",
            message: `"${a.name}" exceeds ${k(l)}`
          });
          continue;
        }
        if (!E(a, w)) {
          i.push({
            file: a,
            reason: "type",
            message: `"${a.name}" is not an accepted file type`
          });
          continue;
        }
        z.push(a);
      }
      let d = p ? [...h, ...z] : z.slice(0, 1);
      d.length > f && (d.slice(f).forEach(
        (B) => i.push({
          file: B,
          reason: "max-files",
          message: `Maximum ${f} file(s); "${B.name}" dropped`
        })
      ), d = d.slice(0, f)), i.length > 0 && r?.(i), v || $(d), g?.(d);
    }, A = (e) => {
      const c = h.filter((i, z) => z !== e);
      v || $(c), g?.(c);
    }, H = (e) => {
      e.preventDefault(), y(!1), !o && e.dataTransfer.files?.length && b(e.dataTransfer.files);
    };
    return /* @__PURE__ */ s("div", { className: C("zen-flex zen-flex-col zen-gap-2", j), children: [
      /* @__PURE__ */ s(
        "div",
        {
          onDragOver: (e) => {
            e.preventDefault(), o || y(!0);
          },
          onDragLeave: () => y(!1),
          onDrop: H,
          onClick: () => !o && x.current?.click(),
          role: "button",
          tabIndex: o ? -1 : 0,
          "aria-disabled": o || void 0,
          onKeyDown: (e) => {
            o || (e.key === "Enter" || e.key === " ") && (e.preventDefault(), x.current?.click());
          },
          className: C(
            "zen-rounded-zen-md zen-border-2 zen-border-dashed zen-p-6 zen-text-center zen-transition-colors zen-cursor-pointer",
            "zen-flex zen-flex-col zen-items-center zen-justify-center zen-gap-2",
            R ? "zen-border-zen-primary zen-bg-zen-primary-soft" : "zen-border-zen-border zen-bg-zen-muted/30",
            "hover:zen-bg-zen-muted/60",
            o && "zen-opacity-50 zen-cursor-not-allowed zen-pointer-events-none",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2"
          ),
          children: [
            /* @__PURE__ */ n(P, {}),
            /* @__PURE__ */ n("div", { className: "zen-text-sm", children: L ?? /* @__PURE__ */ s(O, { children: [
              /* @__PURE__ */ n("span", { className: "zen-font-medium", children: "Click to upload" }),
              " ",
              /* @__PURE__ */ n("span", { className: "zen-text-zen-muted-fg", children: "or drag and drop" })
            ] }) }),
            N ? /* @__PURE__ */ n("div", { className: "zen-text-xs zen-text-zen-muted-fg", children: N }) : l ? /* @__PURE__ */ s("div", { className: "zen-text-xs zen-text-zen-muted-fg", children: [
              "Max ",
              k(l),
              " per file",
              p && f !== 1 / 0 ? ` · up to ${f} files` : ""
            ] }) : null,
            /* @__PURE__ */ n(
              "input",
              {
                ref: x,
                type: "file",
                accept: w,
                multiple: p,
                disabled: o,
                onChange: (e) => {
                  e.target.files?.length && b(e.target.files), e.target.value = "";
                },
                className: "zen-sr-only",
                ...D
              }
            )
          ]
        }
      ),
      F && h.length > 0 ? /* @__PURE__ */ n("ul", { className: "zen-flex zen-flex-col zen-gap-1 zen-text-sm", children: h.map((e, c) => /* @__PURE__ */ s(
        "li",
        {
          className: "zen-flex zen-items-center zen-gap-3 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2",
          children: [
            /* @__PURE__ */ n(T, {}),
            /* @__PURE__ */ s("div", { className: "zen-flex zen-flex-col zen-min-w-0 zen-flex-1", children: [
              /* @__PURE__ */ n("span", { className: "zen-truncate zen-font-medium", children: e.name }),
              /* @__PURE__ */ n("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: k(e.size) })
            ] }),
            /* @__PURE__ */ n(
              U,
              {
                variant: "ghost",
                color: "neutral",
                size: "sm",
                "aria-label": `Remove ${e.name}`,
                onClick: (i) => {
                  i.stopPropagation(), A(c);
                },
                disabled: o,
                children: /* @__PURE__ */ n(X, {})
              }
            )
          ]
        },
        `${e.name}-${c}`
      )) }) : null
    ] });
  }
);
K.displayName = "FileUpload";
const P = () => /* @__PURE__ */ s("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, className: "zen-text-zen-muted-fg", children: [
  /* @__PURE__ */ n("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
  /* @__PURE__ */ n("polyline", { points: "17 8 12 3 7 8" }),
  /* @__PURE__ */ n("line", { x1: "12", y1: "3", x2: "12", y2: "15" })
] }), T = () => /* @__PURE__ */ s("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, className: "zen-text-zen-muted-fg zen-shrink-0", children: [
  /* @__PURE__ */ n("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
  /* @__PURE__ */ n("polyline", { points: "14 2 14 8 20 8" })
] }), X = () => /* @__PURE__ */ s("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
  /* @__PURE__ */ n("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ n("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] });
export {
  K as FileUpload
};
//# sourceMappingURL=index73.js.map
