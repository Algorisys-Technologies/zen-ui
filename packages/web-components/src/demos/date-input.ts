import { DemoPage } from "./demo-helpers";

/**
 * DateInput demo — the web-components mirror of the vanilla DateInputDemo. The
 * fields are uncontrolled (`default-value`): an attribute cannot say null, and
 * these fields can be cleared. The id and name land on the inner input via
 * `input-id` / `input-aria-label`, which `<zen-label for>` can name.
 */

const fmt = (d: Date | null) =>
  d ? d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "empty";

function el(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
}

const div = (className: string, ...kids: Node[]) => {
  const d = document.createElement("div");
  d.className = className;
  d.append(...kids);
  return d;
};

const detail = <T,>(e: Event) => (e as CustomEvent<T>).detail;

/** "Value: <span data-testid=…>…</span>". */
const readout = (testid: string, initial: string, live = false) => {
  const p = document.createElement("p");
  p.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
  if (live) p.setAttribute("aria-live", "polite");
  const value = document.createElement("span");
  value.dataset.testid = testid;
  value.textContent = initial;
  p.append("Value: ", value);
  return { p, value };
};

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function DateInputDemo(): HTMLElement {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return DemoPage({
    title: "DateInput",
    description:
      "A date you type, read in the locale's order, with the calendar as a second way in. Built for data entry: 150326 is 15 March 2026, t is today, +7 is a week ahead. A date that does not exist (31/02) is kept as typed and marked, never rolled over into March.",
    sections: [
      {
        title: "1. Typing a date",
        codeTitle: "Day first (en-IN)",
        codeDescription:
          "Try 150326, 15-3, 1503, 15, 2026-03-15, t, y, +7, -1, +2w, +1m. Enter or Tab reads it; ↑ and ↓ move a day (Shift: a month); Alt+↓ opens the calendar; Esc undoes what you typed. Try 31/02/2026: it stays, marked invalid.",
        code: `<zen-label for="due">Due date</zen-label>
<zen-date-input input-id="due" locale="en-IN" default-value="2026-03-15"></zen-date-input>

due.addEventListener("zen-value-change", (e) => console.log(e.detail));
due.addEventListener("zen-invalid-input", (e) => console.log("not a date:", e.detail));`,
        render: () => {
          let value: Date | null = new Date(2026, 2, 15);
          let rejected = "";
          const out = readout("due-value", fmt(value), true);
          const paint = () => {
            out.value.textContent = fmt(value);
            out.p.replaceChildren("Value: ", out.value);
            if (rejected) {
              const r = document.createElement("span");
              r.dataset.testid = "due-rejected";
              r.textContent = rejected;
              out.p.append(" · not a date: ", r);
            }
          };
          const label = el("zen-label", { for: "due" });
          label.textContent = "Due date";
          const due = el("zen-date-input", { "input-id": "due", locale: "en-IN", "default-value": "2026-03-15" });
          due.addEventListener("zen-value-change", (e) => {
            value = detail<Date | null>(e);
            rejected = "";
            paint();
          });
          due.addEventListener("zen-invalid-input", (e) => {
            rejected = detail<string>(e);
            paint();
          });
          return div("zen-flex zen-flex-col zen-gap-2", label, due, out.p);
        },
      },
      {
        title: "2. Month first",
        codeTitle: "en-US reads 03/15/26 as 15 March",
        codeDescription:
          'The order comes from the locale (or order="mdy" directly). ISO 2026-03-15 is read in every locale.',
        code: `<zen-date-input locale="en-US" input-aria-label="Ship date"></zen-date-input>`,
        render: () => {
          const out = readout("us-value", fmt(null));
          const ship = el("zen-date-input", { locale: "en-US", "input-aria-label": "Ship date" });
          ship.addEventListener("zen-value-change", (e) => (out.value.textContent = fmt(detail<Date | null>(e))));
          return div("zen-flex zen-flex-col zen-gap-2", ship, out.p);
        },
      },
      {
        title: "3. Limits",
        codeTitle: "Only this month, no Sundays",
        codeDescription:
          "min, max and isDateDisabled apply to typed dates and the calendar alike. A date outside them is kept and marked, so the clerk sees what they typed.",
        code: `<zen-date-input min="2026-11-01" max="2026-11-30" input-aria-label="Posting date"></zen-date-input>

posting.isDateDisabled = (d) => d.getDay() === 0;`,
        render: () => {
          const out = readout("posting-value", fmt(null));
          const posting = el("zen-date-input", {
            locale: "en-IN",
            min: iso(monthStart),
            max: iso(monthEnd),
            "input-aria-label": "Posting date",
          }) as HTMLElement & { isDateDisabled: (d: Date) => boolean };
          posting.isDateDisabled = (d) => d.getDay() === 0;
          posting.addEventListener("zen-value-change", (e) => (out.value.textContent = fmt(detail<Date | null>(e))));
          return div("zen-flex zen-flex-col zen-gap-2", posting, out.p);
        },
      },
      {
        title: "4. Disabled",
        codeTitle: "Disabled",
        code: `<zen-date-input disabled default-value="2026-01-01" input-aria-label="Created"></zen-date-input>`,
        render: () =>
          el("zen-date-input", { locale: "en-IN", disabled: "", "default-value": "2026-01-01", "input-aria-label": "Created" }),
      },
    ],
  });
}
