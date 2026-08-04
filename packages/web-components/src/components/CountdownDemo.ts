import { DemoPage } from "./demo-helpers";

const inSeconds = (s: number) => Date.now() + s * 1000;

/** One <zen-timer-badge>, attributes only — the declarative path this layer is for. */
function badge(attrs: Record<string, string | number>): HTMLElement {
  const el = document.createElement("zen-timer-badge");
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
}

function row(...nodes: HTMLElement[]): HTMLElement {
  const box = document.createElement("div");
  box.style.display = "flex";
  box.style.flexWrap = "wrap";
  box.style.alignItems = "center";
  box.style.gap = "1rem";
  box.append(...nodes);
  return box;
}

export default function CountdownDemo(): HTMLElement {
  return DemoPage({
    title: "TimerBadge / TestCountdownBar",
    description:
      "How long is left, and what that means. Both take a deadline rather than a duration, so a throttled background tab cannot hand a candidate extra time.",
    sections: [
      {
        title: "1. A deadline, not a duration",
        codeTitle: "`deadline` is a number attribute — epoch milliseconds",
        codeDescription:
          "Deliberately not a date string or a duration. The whole design is that the figure is computed from a fixed point, so it cannot drift in a tab the browser has throttled to one tick a minute; an attribute carrying '30m' would have to be re-based on load and would reintroduce exactly that drift. A candidate who sees more time than they have is a support ticket at submission.",
        code: `<zen-timer-badge deadline="1785312000000" label="Time left"></zen-timer-badge>`,
        render: () =>
          row(
            badge({ deadline: inSeconds(3600), label: "Time left" }),
            badge({ deadline: inSeconds(240), label: "Section" }),
            badge({ deadline: inSeconds(45), label: "Question" }),
            badge({ deadline: inSeconds(-5), label: "Closed" }),
          ),
      },
      {
        title: "2. Thresholds",
        codeTitle: "`thresholds` is json; `zen-threshold` is the event",
        codeDescription:
          "Seconds remaining at which to escalate, defaulting to [300, 60]. The last minute pulses as well as changing colour, because colour alone fails a colour-blind candidate. Each crossing fires once, going down — as a CustomEvent here rather than a callback, which is what makes it usable from plain markup.",
        code: `<zen-timer-badge deadline="…" thresholds="[600,120]"></zen-timer-badge>

document.querySelector("zen-timer-badge")
  .addEventListener("zen-threshold", (e) => toast(\`\${e.detail / 60} minutes left\`));`,
        render: () => {
          const said = document.createElement("span");
          said.className = "zen-text-xs zen-text-zen-muted-fg";
          said.textContent = "no threshold crossed yet";

          const warning = badge({ deadline: inSeconds(90), thresholds: "[120,30]", label: "Warning" });
          const critical = badge({ deadline: inSeconds(20), thresholds: "[120,30]", label: "Critical" });
          const soon = badge({ deadline: inSeconds(12), thresholds: "[10]", label: "Watch me cross 10s" });
          soon.addEventListener("zen-threshold", (e) => {
            said.textContent = `zen-threshold fired at ${(e as CustomEvent).detail}s`;
          });
          return row(warning, critical, soon, said);
        },
      },
      {
        title: "3. Variants and size",
        codeTitle: "`variant` and `size`",
        codeDescription:
          "'soft' is a tinted pill for a header; 'bare' is text only, for a toolbar that already has its own chrome. The figure is tabular-nums in both, so the badge does not jitter as the digits change width.",
        code: `<zen-timer-badge deadline="…" variant="bare" size="sm"></zen-timer-badge>`,
        render: () =>
          row(
            badge({ deadline: inSeconds(1800), variant: "soft", size: "md", label: "soft md" }),
            badge({ deadline: inSeconds(1800), variant: "soft", size: "sm", label: "soft sm" }),
            badge({ deadline: inSeconds(1800), variant: "bare", size: "md", label: "bare md" }),
            badge({ deadline: inSeconds(1800), variant: "bare", size: "sm", label: "bare sm" }),
          ),
      },
      {
        title: "4. The bar an assessment runs under",
        codeTitle: "`<zen-test-countdown-bar>` slots its middle",
        codeDescription:
          "Light-DOM children land beside the clock — a question counter, a progress bar, whatever the screen needs. That is the element's `content` slot, matching the vanilla factory's `content` prop. `sticky` defaults to TRUE, so it is a json attribute rather than a boolean one: an absent boolean attribute would be passed as an explicit false and silently unpin the bar.",
        code: `<zen-test-countdown-bar deadline="…" title="Kata 3" sticky="false">
  <span>Question 7 of 12</span>
</zen-test-countdown-bar>`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border";

          const bar = document.createElement("zen-test-countdown-bar");
          bar.setAttribute("deadline", String(inSeconds(900)));
          bar.setAttribute("title", "Kata 3 — inventory reconciliation");
          bar.setAttribute("sticky", "false");
          const counter = document.createElement("span");
          counter.className = "zen-text-xs zen-text-zen-muted-fg";
          counter.textContent = "Question 7 of 12";
          bar.append(counter);

          const filler = document.createElement("p");
          filler.className = "zen-m-0 zen-p-4 zen-text-sm zen-text-zen-muted-fg";
          filler.textContent = "The candidate's work goes here.";

          box.append(bar, filler);
          return box;
        },
      },
      {
        title: "5. Expiry, and who owns submission",
        codeTitle: "`zen-expire` fires once",
        codeDescription:
          "Neither element submits anything. What to submit and how is application logic that differs per assessment type, and a component that guessed at it would be wrong for every caller but one. `paused` stops the clock without removing the element — for a test already submitted, or one an invigilator has halted; it defaults to false, so it IS a plain boolean attribute.",
        code: `<zen-timer-badge deadline="…"></zen-timer-badge>
<zen-timer-badge deadline="…" paused></zen-timer-badge>

el.addEventListener("zen-expire", () => form.submit());`,
        render: () => {
          const said = document.createElement("span");
          said.className = "zen-text-xs zen-text-zen-muted-fg";
          said.textContent = "zen-expire has not fired";

          const expiring = badge({ deadline: inSeconds(8), label: "Expires in 8s" });
          expiring.addEventListener("zen-expire", () => {
            said.textContent = "zen-expire fired once";
          });
          return row(expiring, badge({ deadline: inSeconds(600), label: "Paused", paused: "" }), said);
        },
      },
    ],
  });
}
