import * as React from "react";
import { lineEta } from "@algorisys/zen-ui-core/line-eta";
import { plantDayOf } from "@algorisys/zen-ui-core/shifts";
import { machineStateMessageKey, type MachineState } from "@algorisys/zen-ui-core/machine-state";
import { durationMessage } from "@algorisys/zen-ui-core/state-timeline";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";
import { StatePill } from "../state-pill/state-pill";
import { ProductionProgress } from "../production-progress/production-progress";

/**
 * LineCard — one production line at a glance: its state, the order it is
 * running, how far along, and when it will finish — or why it is not moving.
 *
 *   <LineCard
 *     name="Line A" href="/lines/a"
 *     state="running" since={stateSince}
 *     order={{ code: "WO-10042", product: "Bracket", target: 500, good: 361, scrap: 19 }}
 *     perHour={278} timeZone="Asia/Kolkata"
 *   />
 *
 * The last line answers the question a supervisor scanning a wall of these is
 * asking. Running with a rate: "Done by 13:40". Not running: what it is doing
 * instead and for how long, with the cause — never an ETA computed from a rate
 * the line is not producing at. Done: "Order complete".
 *
 * `href` makes the whole card a link (the name is the link; it stretches over
 * the card), so the progress bar inside is not nested in a button.
 */

export type LineCardProps = Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  name: string;
  state: MachineState;
  /** When it entered this state. */
  since?: Date | number;
  /** Why ("Jam at infeed"). */
  cause?: string;
  order?: { code: string; product?: string; target: number; good: number; scrap?: number };
  /** Current output rate, per hour, for the ETA. */
  perHour?: number;
  /** OEE as a fraction, shown small in the corner. */
  oee?: number | null;
  /** Makes the card a link to the line. */
  href?: string;
  timeZone?: string;
  /** Pins the clock, for tests and screenshots. */
  now?: Date | number;
};

export const LineCard = React.forwardRef<HTMLElement, LineCardProps>(
  ({ name, state, since, cause, order, perHour, oee, href, timeZone, now: nowProp, className, ...rest }, ref) => {
    const loc = useLocale();
    const [clock, setClock] = React.useState(() => Date.now());
    React.useEffect(() => {
      const timer = setInterval(() => setClock(Date.now()), 30_000);
      return () => clearInterval(timer);
    }, []);
    const now = +(nowProp ?? clock);

    const eta = order
      ? lineEta({ state, target: order.target, good: order.good, perHour, now })
      : null;
    const stateName = loc.t(machineStateMessageKey(state));
    const forHowLong = () => {
      if (since === undefined) return null;
      const d = durationMessage(Math.max(0, now - +since));
      return loc.t(d.key, d.values);
    };
    const doing = () => {
      const dur = forHowLong();
      if (!dur) return cause ? `${stateName}: ${cause}` : stateName;
      return cause
        ? loc.t("lineCard.sinceWhy", { state: stateName, duration: dur, cause })
        : loc.t("lineCard.since", { state: stateName, duration: dur });
    };
    const footer = () => {
      const e = eta;
      // No order: say so only when the line is plainly running or idle. A line
      // that is down or silent gets what it is doing — with no data we cannot
      // claim there is no order.
      if (!e) return state === "running" || state === "idle" ? loc.t("lineCard.noOrder") : doing();
      if (e.kind === "done") return loc.t("lineCard.done");
      if (e.kind === "eta") {
        // "Same day" in the PLANT's zone — the one the time is shown in.
        const sameDay = plantDayOf(e.at, timeZone) === plantDayOf(now, timeZone);
        const f = new Intl.DateTimeFormat(loc.locale, {
          ...(sameDay ? {} : { weekday: "short" }),
          hour: "2-digit",
          minute: "2-digit",
          timeZone,
        });
        return loc.t("lineCard.eta", { time: f.format(e.at) });
      }
      if (e.kind === "no-rate") return loc.t("lineCard.noRate");
      // Not running, or no data: what it is doing, for how long, and why.
      return doing();
    };
    const footerTone =
      eta?.kind === "not-running" || eta?.kind === "unknown" || (!eta && state !== "running" && state !== "idle")
        ? "zen-font-medium zen-text-zen-foreground"
        : "zen-text-zen-muted-fg";
    const pct = (v: number) =>
      new Intl.NumberFormat(loc.locale, { style: "percent", maximumFractionDigits: 0 }).format(v);

    return (
      <article
        ref={ref}
        data-state={state}
        className={cn(
          "zen-relative zen-flex zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-p-zen-card",
          href && "hover:zen-bg-zen-muted focus-within:zen-ring-2 focus-within:zen-ring-zen-ring",
          className,
        )}
        {...rest}
      >
        <header className="zen-flex zen-items-start zen-justify-between zen-gap-2">
          <h3 className="zen-m-0 zen-text-base zen-font-semibold zen-leading-snug zen-text-zen-foreground">
            {href ? (
              <a
                href={href}
                className="zen-text-inherit zen-no-underline focus-visible:zen-outline-none after:zen-absolute after:zen-inset-0 after:zen-content-empty"
              >
                {name}
              </a>
            ) : (
              name
            )}
          </h3>
          <div className="zen-flex zen-shrink-0 zen-items-center zen-gap-2">
            {oee !== undefined && oee !== null ? (
              <span className="zen-text-xs zen-tabular-nums zen-text-zen-muted-fg">
                {loc.t("lineCard.oee", { value: pct(oee) })}
              </span>
            ) : null}
            <StatePill state={state} size="sm" />
          </div>
        </header>
        {order ? (
          <ProductionProgress
            size="sm"
            label={order.product ? `${order.code} · ${order.product}` : order.code}
            target={order.target}
            good={order.good}
            scrap={order.scrap}
          />
        ) : null}
        <p className={cn("zen-m-0 zen-text-sm zen-tabular-nums", footerTone)}>{footer()}</p>
      </article>
    );
  },
);
LineCard.displayName = "LineCard";
