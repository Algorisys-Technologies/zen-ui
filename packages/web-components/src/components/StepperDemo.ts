import { DemoPage } from "./demo-helpers";

/**
 * Stepper demo — the web-components port. <zen-stepper> is data-driven: set
 * `el.steps = [...]`, where each step's `content` is a Node and `navigation`
 * carries submitLabel / onBeforeNext / onSubmit. `linear` defaults TRUE and is a
 * JS property. The handle (next/prev/goTo/currentIndex/steps) is forwarded onto
 * the element; `zen-value-change` fires on step change.
 */

interface StepNav {
  submitLabel?: string;
  onBeforeNext?: () => boolean;
  onSubmit?: () => void | Promise<void>;
}
interface Step {
  value: string;
  label: string;
  description?: string;
  status?: "error";
  content?: Node;
  navigation?: StepNav | false;
}
type StepperEl = HTMLElement & {
  steps: Step[];
  currentIndex: number;
  next(): void;
  prev(): void;
  goTo(value: string): void;
};

/* ------------------------------ helpers ------------------------------ */

const para = (text: string): HTMLElement => {
  const p = document.createElement("p");
  p.className = "zen-text-sm zen-py-4";
  p.textContent = text;
  return p;
};

const heading = (text: string): HTMLElement => {
  const h = document.createElement("h3");
  h.className = "zen-text-base zen-font-semibold zen-mb-3";
  h.textContent = text;
  return h;
};

const field = (labelText: string, control: Node): HTMLElement => {
  const wrap = document.createElement("div");
  wrap.className = "zen-grid zen-gap-1.5";
  const label = document.createElement("label");
  label.className = "zen-text-sm zen-font-medium";
  label.textContent = labelText;
  wrap.append(label, control);
  return wrap;
};

const grid = (...children: Node[]): HTMLElement => {
  const g = document.createElement("div");
  g.className = "zen-grid zen-gap-4";
  g.append(...children);
  return g;
};

function input(attrs: Record<string, string>, onInput: (v: string) => void): HTMLElement {
  const i = document.createElement("zen-input");
  for (const [k, v] of Object.entries(attrs)) i.setAttribute(k, v);
  i.addEventListener("input", (e) => onInput((e.target as HTMLInputElement).value));
  return i;
}

function select(options: { value: string; label: string }[], onChange: (v: string) => void): HTMLElement {
  const s = document.createElement("zen-select");
  s.setAttribute("placeholder", "Pick one");
  Object.assign(s, { options });
  s.addEventListener("zen-value-change", (e) => onChange((e as CustomEvent).detail as string));
  return s;
}

function makeStepper(spec: {
  defaultValue: string;
  orientation?: "vertical";
  linear?: boolean;
  steps: Step[];
  onValueChange?: () => void;
}): StepperEl {
  const el = document.createElement("zen-stepper") as StepperEl;
  el.setAttribute("default-value", spec.defaultValue);
  if (spec.orientation) el.setAttribute("orientation", spec.orientation);
  Object.assign(el, { steps: spec.steps, ...(spec.linear === false ? { linear: false } : {}) });
  if (spec.onValueChange) el.addEventListener("zen-value-change", spec.onValueChange);
  return el;
}

/* ------------------------- section builders -------------------------- */

function minimalDemo(): HTMLElement {
  return makeStepper({
    defaultValue: "a",
    steps: [
      { value: "a", label: "Welcome", content: para("Welcome screen content.") },
      { value: "b", label: "Profile", content: para("Profile fields would go here.") },
      {
        value: "c",
        label: "Done",
        content: para("All done — final screen."),
        navigation: { submitLabel: "Finish", onSubmit: () => alert("Finished!") },
      },
    ],
  });
}

function onboardingDemo(orientation: "horizontal" | "vertical"): HTMLElement {
  const steps = [
    { value: "basic", label: "Basics", description: "Name + email" },
    { value: "address", label: "Address", description: "Where you live" },
    { value: "identity", label: "Identity", description: "Government ID" },
    { value: "review", label: "Review", description: "Confirm and submit" },
  ];

  const values = { name: "", email: "", street: "", city: "", country: "", idType: "", idNumber: "", agree: false };

  const invalid = (step: HTMLElement, show: boolean) => {
    let msg = step.querySelector<HTMLElement>(".demo-step-error");
    if (!msg) {
      msg = document.createElement("p");
      msg.className = "demo-step-error zen-text-xs zen-text-zen-error zen-mt-2";
      msg.textContent = "Please complete every field to continue.";
      step.append(msg);
    }
    msg.hidden = !show;
  };

  /* Basics */
  const basics = document.createElement("div");
  basics.append(
    heading("Basic info"),
    grid(
      field("Full name", input({ placeholder: "Ada Lovelace" }, (v) => (values.name = v))),
      field("Email", input({ type: "email", placeholder: "you@algorisys.com" }, (v) => (values.email = v))),
    ),
  );

  /* Address */
  const address = document.createElement("div");
  address.append(
    heading("Address"),
    grid(
      field("Street", input({ placeholder: "221B Baker Street" }, (v) => (values.street = v))),
      field("City", input({ placeholder: "Mumbai" }, (v) => (values.city = v))),
      field(
        "Country",
        select(
          [
            { value: "IN", label: "India" },
            { value: "US", label: "United States" },
            { value: "GB", label: "United Kingdom" },
            { value: "DE", label: "Germany" },
          ],
          (v) => (values.country = v),
        ),
      ),
    ),
  );

  /* Identity */
  const identity = document.createElement("div");
  identity.append(
    heading("Government ID"),
    grid(
      field(
        "ID type",
        select(
          [
            { value: "passport", label: "Passport" },
            { value: "drivers_license", label: "Driver's license" },
            { value: "national_id", label: "National ID" },
          ],
          (v) => (values.idType = v),
        ),
      ),
      field("ID number", input({ placeholder: "A1234567" }, (v) => (values.idNumber = v))),
    ),
  );

  /* Review */
  const reviewBody = document.createElement("div");
  const renderSummary = () => {
    const dl = document.createElement("dl");
    dl.className =
      "zen-grid zen-grid-cols-2 zen-gap-x-6 zen-gap-y-2 zen-text-sm zen-border zen-border-zen-border zen-rounded-zen-md zen-p-4";
    const rows: [string, string][] = [
      ["Name", values.name || "—"],
      ["Email", values.email || "—"],
      ["Address", [values.street, values.city, values.country].filter(Boolean).join(", ") || "—"],
      ["ID", values.idType ? `${values.idType} · ${values.idNumber || "—"}` : "—"],
    ];
    for (const [k, v] of rows) {
      const dt = document.createElement("dt");
      dt.className = "zen-text-zen-muted-fg";
      dt.textContent = k;
      const dd = document.createElement("dd");
      dd.textContent = v;
      dl.append(dt, dd);
    }
    const agreeRow = document.createElement("div");
    agreeRow.className = "zen-flex zen-items-center zen-gap-2 zen-mt-4";
    const agree = document.createElement("zen-checkbox");
    if (values.agree) agree.setAttribute("checked", "");
    agree.addEventListener("zen-checked-change", (e) => (values.agree = (e as CustomEvent).detail === true));
    const agreeLabel = document.createElement("span");
    agreeLabel.className = "zen-text-sm";
    agreeLabel.textContent = "I confirm the details above are accurate.";
    agreeRow.append(agree, agreeLabel);

    reviewBody.replaceChildren(heading("Review and submit"), dl, agreeRow);
  };
  renderSummary();

  const showSubmitted = () => {
    const alert = document.createElement("zen-alert");
    alert.setAttribute("color", "success");
    const content = document.createElement("zen-alert-content");
    const title = document.createElement("zen-alert-title");
    title.textContent = "Submitted";
    const desc = document.createElement("zen-alert-description");
    desc.textContent = "Your onboarding has been submitted. We'll email you when the review is complete.";
    content.append(title, desc);
    alert.append(content);
    reviewBody.replaceChildren(heading("Review and submit"), alert);
  };

  return makeStepper({
    orientation: orientation === "vertical" ? "vertical" : undefined,
    defaultValue: "basic",
    steps: [
      {
        ...steps[0],
        content: basics,
        navigation: {
          onBeforeNext: () => {
            const ok = !!values.name && /.+@.+/.test(values.email);
            invalid(basics, !ok);
            return ok;
          },
        },
      },
      {
        ...steps[1],
        content: address,
        navigation: {
          onBeforeNext: () => {
            const ok = !!values.street && !!values.city && !!values.country;
            invalid(address, !ok);
            return ok;
          },
        },
      },
      {
        ...steps[2],
        content: identity,
        navigation: {
          onBeforeNext: () => {
            const ok = !!values.idType && values.idNumber.length >= 4;
            invalid(identity, !ok);
            return ok;
          },
        },
      },
      {
        ...steps[3],
        content: reviewBody,
        navigation: {
          submitLabel: "Submit application",
          onBeforeNext: () => {
            renderSummary();
            if (!values.agree) {
              invalid(reviewBody, true);
              return false;
            }
            return true;
          },
          onSubmit: async () => {
            await new Promise((r) => setTimeout(r, 600));
            showSubmitted();
          },
        },
      },
    ],
  });
}

function nonLinearDemo(): HTMLElement {
  return makeStepper({
    linear: false,
    defaultValue: "planning",
    steps: [
      { value: "planning", label: "Planning", content: para("Click any step header — non-linear mode lets you jump around.") },
      { value: "design", label: "Design", content: para("Design content.") },
      { value: "build", label: "Build", content: para("Build content.") },
      { value: "ship", label: "Ship", content: para("Ship content."), navigation: { submitLabel: "Done", onSubmit: () => undefined } },
    ],
  });
}

function errorStateDemo(): HTMLElement {
  const conf = document.createElement("div");
  const p = document.createElement("p");
  p.className = "zen-text-sm zen-py-4";
  p.textContent =
    'The Payment step has status "error"; its indicator turns red and the label uses --zen-color-error.';
  conf.append(p);
  return makeStepper({
    linear: false,
    defaultValue: "c",
    steps: [
      { value: "a", label: "Account", content: para("Account content.") },
      { value: "b", label: "Payment", description: "Card declined", status: "error", content: para("Payment content.") },
      { value: "c", label: "Confirmation", content: conf },
    ],
  });
}

function programmaticDemo(): HTMLElement {
  const wrap = document.createElement("div");
  const caption = document.createElement("p");
  caption.className = "zen-text-xs zen-text-zen-muted-fg zen-mb-3";

  const stepper = makeStepper({
    defaultValue: "welcome",
    onValueChange: () => syncCaption(),
    steps: [
      { value: "welcome", label: "Welcome", content: para("Use the buttons below to drive the Stepper from outside its navigation bar.") },
      { value: "middle", label: "Middle", content: para("Middle content.") },
      { value: "review", label: "Review", content: para("Review content."), navigation: false },
    ],
  });

  const syncCaption = () => {
    caption.textContent = `Step ${stepper.currentIndex + 1} of ${stepper.steps.length}`;
  };
  syncCaption();

  const btn = (text: string, onClick: () => void, variant = true): HTMLElement => {
    const b = document.createElement("zen-button");
    if (variant) {
      b.setAttribute("variant", "outline");
      b.setAttribute("color", "neutral");
    }
    b.textContent = text;
    b.addEventListener("click", onClick);
    return b;
  };

  const controls = document.createElement("div");
  controls.className = "zen-flex zen-gap-2 zen-mt-4";
  controls.append(
    btn("Prev", () => stepper.prev()),
    btn("Next", () => stepper.next()),
    btn("Skip to review", () => stepper.goTo("review"), false),
  );

  wrap.append(caption, stepper, controls);
  return wrap;
}

/* ------------------------------ page --------------------------------- */

export default function StepperDemo(): HTMLElement {
  return DemoPage({
    title: "Stepper / Wizard",
    description:
      "Multi-step navigation for onboarding and data-collection journey apps. React ships a compound API (<Stepper>/<StepperList>/<StepperPanel>/<StepperNavigation>) wired through context; with no framework this collapses to one data-driven factory — a flat steps array carries each step's label, content and navigation — exactly as Accordion and Solid's Select do. The returned handle exposes what useStepper returned: currentIndex, isFirst, isLast, next(), prev(), goTo().",
    sections: [
      {
        title: "1. Minimal",
        codeTitle: "Three steps, no validation, default linear mode",
        code: `const stepper = document.createElement("zen-stepper");
stepper.setAttribute("default-value", "a");
stepper.steps = [
  { value: "a", label: "Welcome", content: welcomeNode },
  { value: "b", label: "Profile", content: profileNode },
  { value: "c", label: "Done", content: doneNode,
    navigation: { submitLabel: "Finish", onSubmit: () => alert("Finished!") } },
];`,
        render: minimalDemo,
      },
      {
        title: "2. Onboarding flow with per-step validation",
        codeTitle: "Gate forward navigation on onBeforeNext",
        codeDescription:
          "Continue only fires when onBeforeNext returns true. The last step's onSubmit runs after its own validation. Panels stay mounted across navigation, so field values persist — the vanilla equivalent of React holding form state outside the DOM.",
        code: `stepper.steps = [
  { value: "basic", label: "Basics", content: basicsFields,
    navigation: { onBeforeNext: () => nameOk && emailOk } },
  { value: "review", label: "Review", content: reviewBody,
    navigation: {
      submitLabel: "Submit application",
      onBeforeNext: () => agreed,
      onSubmit: async () => { await save(); showSubmitted(); },
    } },
];`,
        render: () => onboardingDemo("horizontal"),
      },
      {
        title: "3. Vertical orientation",
        codeTitle: 'orientation="vertical"',
        codeDescription:
          "The list sits to the left of the panels; useful when the form is short per step but you want the full journey visible.",
        code: `<zen-stepper orientation="vertical"></zen-stepper>   // stepper.steps = [...]`,
        render: () => onboardingDemo("vertical"),
      },
      {
        title: "4. Non-linear navigation",
        codeTitle: "linear: false — any header is clickable",
        codeDescription:
          "In linear mode (default) only completed + current steps are clickable. Setting linear to false (a JS property) lets the user jump to any step.",
        code: `stepper.linear = false;   // default is true`,
        render: nonLinearDemo,
      },
      {
        title: "5. Error state on a step",
        codeTitle: 'Override status: "error" on any step to surface a problem',
        codeDescription:
          "Useful when a downstream check fails (card declined, identity rejected) and you want the step header to flag it even after the user has moved past it.",
        code: `stepper.steps = [
  { value: "a", label: "Account" },
  { value: "b", label: "Payment", description: "Card declined", status: "error" },
  { value: "c", label: "Confirmation" },
];`,
        render: errorStateDemo,
      },
      {
        title: "6. Programmatic control via the handle",
        codeTitle: "Read + drive Stepper state from outside",
        codeDescription:
          "The forwarded handle is the same API React exposed through useStepper: currentIndex, isFirst, isLast, next(), prev(), goTo(value).",
        code: `const stepper = document.createElement("zen-stepper");
// …
skipBtn.addEventListener("click", () => stepper.goTo("review"));
caption.textContent = \`Step \${stepper.currentIndex + 1} of \${stepper.steps.length}\`;`,
        render: programmaticDemo,
      },
    ],
  });
}
