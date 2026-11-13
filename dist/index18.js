import { jsxs as w, jsx as o } from "react/jsx-runtime";
import * as i from "react";
import { useLocale as U } from "./index90.js";
import { cn as d } from "./index197.js";
const A = i.forwardRef(
  ({
    value: g,
    defaultValue: T,
    onValueChange: x,
    placeholder: D,
    disabled: h,
    max: s,
    delimiters: v = [","],
    unique: m = !0,
    validate: a,
    normalize: k = (f) => f.trim(),
    className: $,
    renderTag: N,
    inputAriaLabel: j
  }, B) => {
    const f = U(), C = D ?? f.t("tagInput.placeholder"), [L, R] = i.useState(
      T ?? []
    ), t = g ?? L, [r, c] = i.useState(""), z = i.useCallback(
      (e) => {
        g === void 0 && R(e), x?.(e);
      },
      [g, x]
    ), p = i.useCallback(
      async (e) => {
        const n = k(e);
        return n ? m && t.includes(n) ? !0 : s !== void 0 && t.length >= s || a && !await a(n) ? !1 : (z([...t, n]), !0) : !1;
      },
      [t, s, m, a, k, z]
    ), b = (e) => {
      const n = t.slice();
      n.splice(e, 1), z(n);
    }, S = async (e) => {
      e.key === "Enter" ? (e.preventDefault(), await p(r) && c("")) : e.key === "Tab" && r.trim().length > 0 ? await p(r) && (e.preventDefault(), c("")) : e.key === "Backspace" && r.length === 0 && t.length > 0 ? b(t.length - 1) : v.includes(e.key) && r.trim().length > 0 && (e.preventDefault(), await p(r) && c(""));
    }, E = async (e) => {
      const n = e.clipboardData.getData("text");
      if (!n) return;
      const y = new RegExp(
        `[${v.map((u) => `\\${u}`).join("")}\\n\\r\\t]+`
      ), I = n.split(y).map(k).filter(Boolean);
      if (I.length <= 1) return;
      e.preventDefault();
      let l = t;
      for (const u of I) {
        if (s !== void 0 && l.length >= s) break;
        m && l.includes(u) || a && !await a(u) || (l = [...l, u]);
      }
      z(l);
    };
    return /* @__PURE__ */ w(
      "div",
      {
        className: d(
          "zen-flex zen-flex-wrap zen-items-center zen-gap-1.5",
          "zen-min-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
          "zen-px-2 zen-py-1.5 zen-text-sm",
          "focus-within:zen-outline-none focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
          h && "zen-opacity-50 zen-cursor-not-allowed",
          $
        ),
        onClick: (e) => {
          const n = e.target;
          n.tagName !== "BUTTON" && n.tagName !== "INPUT" && e.currentTarget.querySelector(
            "input"
          )?.focus();
        },
        children: [
          t.map(
            (e, n) => N ? /* @__PURE__ */ o(i.Fragment, { children: N(e, () => b(n)) }, `${e}-${n}`) : /* @__PURE__ */ w(
              "span",
              {
                className: d(
                  "zen-inline-flex zen-items-center zen-gap-1 zen-px-2 zen-py-0.5",
                  "zen-text-xs zen-font-medium",
                  "zen-rounded-zen-full zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"
                ),
                children: [
                  /* @__PURE__ */ o("span", { children: e }),
                  /* @__PURE__ */ o(
                    "button",
                    {
                      type: "button",
                      onClick: () => b(n),
                      "aria-label": f.t("tagInput.remove", { tag: e }),
                      disabled: h,
                      className: d(
                        "zen-inline-flex zen-items-center zen-justify-center",
                        "zen-h-4 zen-w-4 zen-rounded-zen-full zen-bg-transparent zen-border-0 zen-cursor-pointer",
                        "zen-text-current zen-opacity-70 hover:zen-opacity-100 hover:zen-bg-black/10",
                        "focus-visible:zen-outline-none focus-visible:zen-ring-1 focus-visible:zen-ring-zen-ring",
                        "disabled:zen-cursor-not-allowed"
                      ),
                      children: /* @__PURE__ */ w(
                        "svg",
                        {
                          width: "10",
                          height: "10",
                          viewBox: "0 0 24 24",
                          fill: "none",
                          stroke: "currentColor",
                          strokeWidth: "3",
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          "aria-hidden": !0,
                          children: [
                            /* @__PURE__ */ o("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                            /* @__PURE__ */ o("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
                          ]
                        }
                      )
                    }
                  )
                ]
              },
              `${e}-${n}`
            )
          ),
          /* @__PURE__ */ o(
            "input",
            {
              ref: B,
              value: r,
              onChange: (e) => c(e.target.value),
              onKeyDown: S,
              onPaste: E,
              onBlur: async () => {
                if (r.trim().length === 0) return;
                await p(r) && c("");
              },
              placeholder: t.length === 0 ? C : "",
              disabled: h,
              "aria-label": j,
              className: d(
                "zen-flex-1 zen-min-w-[6rem] zen-bg-transparent zen-border-0",
                "zen-text-sm zen-outline-none placeholder:zen-text-zen-muted-fg",
                "disabled:zen-cursor-not-allowed"
              )
            }
          )
        ]
      }
    );
  }
);
A.displayName = "TagInput";
export {
  A as TagInput
};
//# sourceMappingURL=index18.js.map
