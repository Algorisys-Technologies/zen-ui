import { TimerBadge, TestCountdownBar } from "./countdown/countdown";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

/* Deadlines relative to load, so every section shows a live clock rather than an
   expired one — the whole point is that the figure moves. */
const inSeconds = (s: number) => Date.now() + s * 1000;

export default function CountdownDemo(): HTMLElement {
  return DemoPage({
    title: "TimerBadge / TestCountdownBar",
    description:
      "How long is left, and what that means. Both take a deadline rather than a duration, so a throttled background tab cannot hand a candidate extra time.",
    sections: [
      {
        title: "1. A deadline, not a duration",
        codeTitle: "`deadline` is epoch milliseconds",
        codeDescription:
          "A component that decrements a number on an interval runs slow in a background tab — the browser throttles the timer to once a minute and the candidate sees more time than they have, while the server disagrees at submission. `deadline - now` cannot drift, so a tab that wakes after two minutes asleep shows the truth immediately rather than catching up.",
        code: `TimerBadge({ deadline: endsAt, onExpire: submit }).el`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "1rem";
          row.style.alignItems = "center";
          row.style.flexWrap = "wrap";
          row.append(
            TimerBadge({ deadline: inSeconds(3600), label: "Time left" }).el,
            TimerBadge({ deadline: inSeconds(240), label: "Section" }).el,
            TimerBadge({ deadline: inSeconds(45), label: "Question" }).el,
            TimerBadge({ deadline: inSeconds(-5), label: "Closed" }).el,
          );
          return row;
        },
      },
      {
        title: "2. Thresholds",
        codeTitle: "`thresholds`, and `onThreshold`",
        codeDescription:
          "Seconds remaining at which to escalate, defaulting to [300, 60] — five minutes to warning, one to critical. The last minute pulses as well as changing colour, because colour alone fails a colour-blind candidate and this is the one moment the component must not be missable. onThreshold fires once per crossing, going down, for a toast or an announcement.",
        code: `TimerBadge({
  deadline: endsAt,
  thresholds: [600, 120],
  onThreshold: (s) => toast(\`\${s / 60} minutes left\`),
}).el`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "1rem";
          row.style.alignItems = "center";
          row.style.flexWrap = "wrap";
          row.append(
            TimerBadge({ deadline: inSeconds(90), thresholds: [120, 30], label: "Warning" }).el,
            TimerBadge({ deadline: inSeconds(20), thresholds: [120, 30], label: "Critical" }).el,
          );
          return row;
        },
      },
      {
        title: "3. Variants and size",
        codeTitle: "`variant` and `size`",
        codeDescription:
          "'soft' is a tinted pill for a header; 'bare' is text only, for a toolbar that already has its own chrome. The figure is tabular-nums in both, so the badge does not jitter as the digits change width.",
        code: `TimerBadge({ deadline: endsAt, variant: "bare", size: "sm" }).el`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "1rem";
          row.style.alignItems = "center";
          row.style.flexWrap = "wrap";
          row.append(
            TimerBadge({ deadline: inSeconds(1800), variant: "soft", size: "md", label: "soft md" }).el,
            TimerBadge({ deadline: inSeconds(1800), variant: "soft", size: "sm", label: "soft sm" }).el,
            TimerBadge({ deadline: inSeconds(1800), variant: "bare", size: "md", label: "bare md" }).el,
            TimerBadge({ deadline: inSeconds(1800), variant: "bare", size: "sm", label: "bare sm" }).el,
          );
          return row;
        },
      },
      {
        title: "4. The bar an assessment runs under",
        codeTitle: "`TestCountdownBar`",
        codeDescription:
          "A <header> with the timer, whatever the app wants beside it, and its actions. `content` takes the middle slot — vanilla spells it that way because `children` on a factory already means the root's children. Sticky by default at the same z-30 layer as Banner, so two sticky bars in one app stack predictably rather than by DOM accident.",
        code: `TestCountdownBar({
  deadline: endsAt,
  title: "Kata 3 — inventory reconciliation",
  content: progressEl,
  actions: submitButton.el,
  onExpire: submit,
}).el`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-w-full zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border";

          const progress = document.createElement("span");
          progress.className = "zen-text-xs zen-text-zen-muted-fg";
          progress.textContent = "Question 7 of 12";

          box.append(
            TestCountdownBar({
              deadline: inSeconds(900),
              title: "Kata 3 — inventory reconciliation",
              content: progress,
              actions: Button({ size: "sm", children: "Submit" }).el,
              sticky: false,
            }).el,
          );
          const filler = document.createElement("p");
          filler.className = "zen-m-0 zen-p-4 zen-text-sm zen-text-zen-muted-fg";
          filler.textContent = "The candidate's work goes here.";
          box.append(filler);
          return box;
        },
      },
      {
        title: "5. Expiry, and who owns submission",
        codeTitle: "`onExpire` fires once, and hands control back",
        codeDescription:
          "Neither component submits anything. What to submit and how is application logic that differs per assessment type, and a component that guessed at it would be wrong for every caller but one. `paused` stops the clock without unmounting — for a test that is already submitted, or one an invigilator has halted.",
        code: `TimerBadge({ deadline: endsAt, onExpire: () => form.submit() }).el
TimerBadge({ deadline: endsAt, paused: true }).el   // halted, still visible`,
        render: () => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "1rem";
          row.style.alignItems = "center";
          row.style.flexWrap = "wrap";

          const said = document.createElement("span");
          said.className = "zen-text-xs zen-text-zen-muted-fg";
          said.textContent = "onExpire has not fired";

          row.append(
            TimerBadge({
              deadline: inSeconds(8),
              label: "Expires in 8s",
              onExpire: () => {
                said.textContent = "onExpire fired once";
              },
            }).el,
            TimerBadge({ deadline: inSeconds(600), label: "Paused", paused: true }).el,
            said,
          );
          return row;
        },
      },
    ],
  });
}
