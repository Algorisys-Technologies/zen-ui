import { jsxs as v, jsx as u } from "react/jsx-runtime";
import * as s from "react";
import { createScanBuffer as $, classifyEntry as q } from "./index126.js";
import { useLocale as A } from "./index90.js";
import { Icon as h } from "./index63.js";
import { cn as x } from "./index197.js";
const B = (c) => c instanceof HTMLElement && (c.isContentEditable || c instanceof HTMLInputElement || c instanceof HTMLTextAreaElement || c instanceof HTMLSelectElement), F = s.forwardRef(
  ({ onScan: c, label: T, placeholder: L, allowTyping: N, captureGlobal: m, scanOptions: z, clearOnScan: I, disabled: y, className: M, ...C }, D) => {
    const d = A(), l = s.useId(), [e, p] = s.useState({ kind: "idle" }), a = s.useRef(null), f = s.useRef([]), E = s.useRef(0), k = async (n, o) => {
      const t = n.trim();
      if (!t || y) return;
      if (I !== !1 && a.current && (a.current.value = ""), o === "keyboard" && N === !1) {
        p({ kind: "error", message: d.t("scan.typed", { code: t }) });
        return;
      }
      const b = ++E.current;
      p({ kind: "checking", code: t });
      let i;
      try {
        i = await c(t, { source: o });
      } catch (r) {
        i = r instanceof Error ? r.message : String(r);
      }
      b === E.current && p(i ? { kind: "error", message: i } : { kind: "accepted", code: t });
    }, g = s.useRef(k);
    g.current = k;
    const w = s.useRef(z);
    w.current = z;
    const H = (n) => {
      if (n.key === "Enter") {
        n.preventDefault();
        const o = q(f.current, z);
        f.current = [], k(a.current?.value ?? "", o);
        return;
      }
      f.current.push({ key: n.key, at: n.timeStamp });
    }, j = () => {
      a.current && a.current.value === "" && (f.current = []);
    };
    s.useEffect(() => {
      if (!m) return;
      const n = w.current, o = $(n);
      let t;
      const b = n?.maxGapMs ?? 35, i = (r) => {
        if (r.defaultPrevented || B(r.target)) return;
        const R = o.push(r.key, r.timeStamp);
        clearTimeout(t), R ? (r.preventDefault(), g.current(R, "scanner")) : o.pending() && (t = setTimeout(() => {
          const S = o.flush(performance.now());
          S && g.current(S, "scanner");
        }, b + 15));
      };
      return document.addEventListener("keydown", i, !0), () => {
        document.removeEventListener("keydown", i, !0), clearTimeout(t);
      };
    }, [m]);
    const K = e.kind === "checking" ? d.t("scan.checking", { code: e.code }) : e.kind === "accepted" ? d.t("scan.accepted", { code: e.code }) : e.kind === "error" ? e.message : m ? d.t("scan.listening") : "";
    return /* @__PURE__ */ v("div", { ref: D, className: x("zen-flex zen-w-full zen-flex-col zen-gap-1.5", M), ...C, children: [
      /* @__PURE__ */ u("label", { htmlFor: l, className: "zen-text-sm zen-font-medium zen-text-zen-foreground", children: T ?? d.t("scan.label") }),
      /* @__PURE__ */ v("div", { className: "zen-relative", children: [
        /* @__PURE__ */ u("span", { className: "zen-pointer-events-none zen-absolute zen-inset-y-0 zen-start-3 zen-flex zen-items-center zen-text-zen-muted-fg", "aria-hidden": "true", children: /* @__PURE__ */ u(h, { name: "scan-barcode", size: 20 }) }),
        /* @__PURE__ */ u(
          "input",
          {
            ref: a,
            id: l,
            type: "text",
            inputMode: "text",
            autoComplete: "off",
            autoCapitalize: "off",
            spellCheck: !1,
            disabled: y,
            placeholder: L,
            "aria-invalid": e.kind === "error" ? !0 : void 0,
            "aria-describedby": `${l}-status`,
            className: x(
              "zen-flex zen-h-12 zen-w-full zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-ps-11 zen-pe-3 zen-font-mono zen-text-lg",
              "placeholder:zen-font-sans placeholder:zen-text-base placeholder:zen-text-zen-muted-fg",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
              "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
              "aria-[invalid=true]:zen-border-zen-error"
            ),
            onKeyDown: H,
            onInput: j
          }
        )
      ] }),
      /* @__PURE__ */ v(
        "p",
        {
          id: `${l}-status`,
          role: "status",
          className: x(
            "zen-m-0 zen-flex zen-min-h-5 zen-items-center zen-gap-1.5 zen-text-sm",
            e.kind === "error" ? "zen-font-medium zen-text-zen-error" : e.kind === "accepted" ? "zen-text-zen-success-soft-fg" : "zen-text-zen-muted-fg"
          ),
          children: [
            e.kind === "accepted" ? /* @__PURE__ */ u(h, { name: "check", size: 16 }) : null,
            e.kind === "error" ? /* @__PURE__ */ u(h, { name: "error", size: 16 }) : null,
            K
          ]
        }
      )
    ] });
  }
);
F.displayName = "ScanInput";
export {
  F as ScanInput
};
//# sourceMappingURL=index125.js.map
