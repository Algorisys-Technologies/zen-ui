import { jsxs as u, jsx as o } from "react/jsx-runtime";
import * as z from "react";
import { lineEta as M } from "./index142.js";
import { plantDayOf as x } from "./index136.js";
import { machineStateMessageKey as P } from "./index116.js";
import { durationMessage as R } from "./index120.js";
import { useLocale as S } from "./index90.js";
import { StatePill as E } from "./index115.js";
import { ProductionProgress as O } from "./index127.js";
import { cn as h } from "./index197.js";
const T = z.forwardRef(
  ({ name: f, state: r, since: g, cause: a, order: n, perHour: b, oee: l, href: c, timeZone: d, now: w, className: k, ...v }, y) => {
    const t = S(), [C, N] = z.useState(() => Date.now());
    z.useEffect(() => {
      const e = setInterval(() => N(Date.now()), 3e4);
      return () => clearInterval(e);
    }, []);
    const m = +(w ?? C), i = n ? M({ state: r, target: n.target, good: n.good, perHour: b, now: m }) : null, s = t.t(P(r)), D = () => {
      if (g === void 0) return null;
      const e = R(Math.max(0, m - +g));
      return t.t(e.key, e.values);
    }, p = () => {
      const e = D();
      return e ? a ? t.t("lineCard.sinceWhy", { state: s, duration: e, cause: a }) : t.t("lineCard.since", { state: s, duration: e }) : a ? `${s}: ${a}` : s;
    }, I = () => {
      const e = i;
      if (!e) return r === "running" || r === "idle" ? t.t("lineCard.noOrder") : p();
      if (e.kind === "done") return t.t("lineCard.done");
      if (e.kind === "eta") {
        const j = x(e.at, d) === x(m, d), F = new Intl.DateTimeFormat(t.locale, {
          ...j ? {} : { weekday: "short" },
          hour: "2-digit",
          minute: "2-digit",
          timeZone: d
        });
        return t.t("lineCard.eta", { time: F.format(e.at) });
      }
      return e.kind === "no-rate" ? t.t("lineCard.noRate") : p();
    }, L = i?.kind === "not-running" || i?.kind === "unknown" || !i && r !== "running" && r !== "idle" ? "zen-font-medium zen-text-zen-foreground" : "zen-text-zen-muted-fg", $ = (e) => new Intl.NumberFormat(t.locale, { style: "percent", maximumFractionDigits: 0 }).format(e);
    return /* @__PURE__ */ u(
      "article",
      {
        ref: y,
        "data-state": r,
        className: h(
          "zen-relative zen-flex zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-p-zen-card",
          c && "hover:zen-bg-zen-muted focus-within:zen-ring-2 focus-within:zen-ring-zen-ring",
          k
        ),
        ...v,
        children: [
          /* @__PURE__ */ u("header", { className: "zen-flex zen-items-start zen-justify-between zen-gap-2", children: [
            /* @__PURE__ */ o("h3", { className: "zen-m-0 zen-text-base zen-font-semibold zen-leading-snug zen-text-zen-foreground", children: c ? /* @__PURE__ */ o(
              "a",
              {
                href: c,
                className: "zen-text-inherit zen-no-underline focus-visible:zen-outline-none after:zen-absolute after:zen-inset-0 after:zen-content-empty",
                children: f
              }
            ) : f }),
            /* @__PURE__ */ u("div", { className: "zen-flex zen-shrink-0 zen-items-center zen-gap-2", children: [
              l != null ? /* @__PURE__ */ o("span", { className: "zen-text-xs zen-tabular-nums zen-text-zen-muted-fg", children: t.t("lineCard.oee", { value: $(l) }) }) : null,
              /* @__PURE__ */ o(E, { state: r, size: "sm" })
            ] })
          ] }),
          n ? /* @__PURE__ */ o(
            O,
            {
              size: "sm",
              label: n.product ? `${n.code} · ${n.product}` : n.code,
              target: n.target,
              good: n.good,
              scrap: n.scrap
            }
          ) : null,
          /* @__PURE__ */ o("p", { className: h("zen-m-0 zen-text-sm zen-tabular-nums", L), children: I() })
        ]
      }
    );
  }
);
T.displayName = "LineCard";
export {
  T as LineCard
};
//# sourceMappingURL=index141.js.map
