import { DateInput } from "./form/date-picker/date-input";
import { Label } from "./form/label/label";
import { DemoPage } from "./demo-helpers";

const fmt = (d: Date | null) =>
  d ? d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "empty";

const div = (className: string, ...kids: Node[]) => {
  const d = document.createElement("div");
  d.className = className;
  d.append(...kids);
  return d;
};

/** "Value: <span data-testid=…>…</span>", repainted by the caller. */
const readout = (testid: string, live = false) => {
  const p = document.createElement("p");
  p.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
  if (live) p.setAttribute("aria-live", "polite");
  const value = document.createElement("span");
  value.dataset.testid = testid;
  p.append("Value: ", value);
  return { p, value };
};

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
        code: `host.append(Label({ for: "due", children: "Due date" }).el);
const due = DateInput({
  id: "due",
  locale: "en-IN",
  value: date,
  onValueChange: (d) => due.update({ value: (date = d) }),
  onInvalidInput: (text) => console.log("not a date:", text),
});
host.append(due.el);`,
        render: () => {
          let value: Date | null = new Date(2026, 2, 15);
          let rejected = "";
          const out = readout("due-value", true);
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
          const due = DateInput({
            id: "due",
            locale: "en-IN",
            value,
            onValueChange: (d) => {
              value = d;
              rejected = "";
              due.update({ value: d });
              paint();
            },
            onInvalidInput: (text) => {
              rejected = text;
              paint();
            },
          });
          paint();
          return div("zen-flex zen-flex-col zen-gap-2", Label({ for: "due", children: "Due date" }).el, due.el, out.p);
        },
      },
      {
        title: "2. Month first",
        codeTitle: "en-US reads 03/15/26 as 15 March",
        codeDescription:
          'The order comes from the locale (or order: "mdy" directly). ISO 2026-03-15 is read in every locale.',
        code: `DateInput({ locale: "en-US", value: d, onValueChange: setD, "aria-label": "Ship date" })`,
        render: () => {
          const out = readout("us-value");
          out.value.textContent = fmt(null);
          const ship = DateInput({
            locale: "en-US",
            value: null,
            onValueChange: (d) => {
              ship.update({ value: d });
              out.value.textContent = fmt(d);
            },
            "aria-label": "Ship date",
          });
          return div("zen-flex zen-flex-col zen-gap-2", ship.el, out.p);
        },
      },
      {
        title: "3. Limits",
        codeTitle: "Only this month, no Sundays",
        codeDescription:
          "min, max and isDateDisabled apply to typed dates and the calendar alike. A date outside them is kept and marked, so the clerk sees what they typed.",
        code: `DateInput({
  min: monthStart, max: monthEnd,
  isDateDisabled: (d) => d.getDay() === 0,
  value: posting, onValueChange: setPosting,
  "aria-label": "Posting date",
})`,
        render: () => {
          const out = readout("posting-value");
          out.value.textContent = fmt(null);
          const posting = DateInput({
            locale: "en-IN",
            min: monthStart,
            max: monthEnd,
            isDateDisabled: (d) => d.getDay() === 0,
            value: null,
            onValueChange: (d) => {
              posting.update({ value: d });
              out.value.textContent = fmt(d);
            },
            "aria-label": "Posting date",
          });
          return div("zen-flex zen-flex-col zen-gap-2", posting.el, out.p);
        },
      },
      {
        title: "4. Disabled",
        codeTitle: "Disabled",
        code: `DateInput({ disabled: true, defaultValue: new Date(2026, 0, 1), "aria-label": "Created" })`,
        render: () =>
          DateInput({ locale: "en-IN", disabled: true, defaultValue: new Date(2026, 0, 1), "aria-label": "Created" }).el,
      },
    ],
  });
}
