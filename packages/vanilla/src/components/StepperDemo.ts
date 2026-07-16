import { Stepper, type StepperStep } from "./stepper/stepper";
import { Input } from "./form/input/input";
import { Select } from "./form/select/select";
import { Checkbox } from "./form/checkbox/checkbox";
import { Button } from "./button/button";
import {
  Alert,
  AlertContent,
  AlertTitle,
  AlertDescription,
} from "./alert/alert";
import { DemoPage } from "./demo-helpers";

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

/* ------------------------- section builders -------------------------- */

function minimalDemo(): HTMLElement {
  return Stepper({
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
  }).el;
}

function onboardingDemo(orientation: "horizontal" | "vertical"): HTMLElement {
  const steps: StepperStep[] = [
    { value: "basic", label: "Basics", description: "Name + email" },
    { value: "address", label: "Address", description: "Where you live" },
    { value: "identity", label: "Identity", description: "Government ID" },
    { value: "review", label: "Review", description: "Confirm and submit" },
  ];

  const values = {
    name: "",
    email: "",
    street: "",
    city: "",
    country: "",
    idType: "",
    idNumber: "",
    agree: false,
  };

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
  const nameInput = Input({ placeholder: "Ada Lovelace", onInput: (e) => (values.name = (e.target as HTMLInputElement).value) });
  const emailInput = Input({ type: "email", placeholder: "you@algorisys.com", onInput: (e) => (values.email = (e.target as HTMLInputElement).value) });
  const basics = document.createElement("div");
  basics.append(
    heading("Basic info"),
    grid(field("Full name", nameInput.el), field("Email", emailInput.el)),
  );

  /* Address */
  const streetInput = Input({ placeholder: "221B Baker Street", onInput: (e) => (values.street = (e.target as HTMLInputElement).value) });
  const cityInput = Input({ placeholder: "Mumbai", onInput: (e) => (values.city = (e.target as HTMLInputElement).value) });
  const countrySelect = Select({
    placeholder: "Pick one",
    options: [
      { value: "IN", label: "India" },
      { value: "US", label: "United States" },
      { value: "GB", label: "United Kingdom" },
      { value: "DE", label: "Germany" },
    ],
    onValueChange: (v) => (values.country = v),
  });
  const address = document.createElement("div");
  address.append(
    heading("Address"),
    grid(field("Street", streetInput.el), field("City", cityInput.el), field("Country", countrySelect.el)),
  );

  /* Identity */
  const idTypeSelect = Select({
    placeholder: "Pick one",
    options: [
      { value: "passport", label: "Passport" },
      { value: "drivers_license", label: "Driver's license" },
      { value: "national_id", label: "National ID" },
    ],
    onValueChange: (v) => (values.idType = v),
  });
  const idNumberInput = Input({ placeholder: "A1234567", onInput: (e) => (values.idNumber = (e.target as HTMLInputElement).value) });
  const identity = document.createElement("div");
  identity.append(
    heading("Government ID"),
    grid(field("ID type", idTypeSelect.el), field("ID number", idNumberInput.el)),
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
    const agree = Checkbox({ checked: values.agree, onCheckedChange: (c) => (values.agree = c === true) });
    const agreeLabel = document.createElement("span");
    agreeLabel.className = "zen-text-sm";
    agreeLabel.textContent = "I confirm the details above are accurate.";
    agreeRow.append(agree.el, agreeLabel);

    reviewBody.replaceChildren(heading("Review and submit"), dl, agreeRow);
  };
  renderSummary();

  const showSubmitted = () => {
    reviewBody.replaceChildren(
      heading("Review and submit"),
      Alert({
        color: "success",
        children: AlertContent({
          children: [
            AlertTitle({ children: "Submitted" }),
            AlertDescription({
              children:
                "Your onboarding has been submitted. We'll email you when the review is complete.",
            }),
          ],
        }),
      }).el,
    );
  };

  return Stepper({
    orientation,
    defaultValue: "basic",
    steps: [
      {
        ...steps[0],
        content: basics,
        navigation: { onBeforeNext: () => { const ok = !!values.name && /.+@.+/.test(values.email); invalid(basics, !ok); return ok; } },
      },
      {
        ...steps[1],
        content: address,
        navigation: { onBeforeNext: () => { const ok = !!values.street && !!values.city && !!values.country; invalid(address, !ok); return ok; } },
      },
      {
        ...steps[2],
        content: identity,
        navigation: { onBeforeNext: () => { const ok = !!values.idType && values.idNumber.length >= 4; invalid(identity, !ok); return ok; } },
      },
      {
        ...steps[3],
        content: reviewBody,
        navigation: {
          submitLabel: "Submit application",
          onBeforeNext: () => { renderSummary(); if (!values.agree) { invalid(reviewBody, true); return false; } return true; },
          onSubmit: async () => { await new Promise((r) => setTimeout(r, 600)); showSubmitted(); },
        },
      },
    ],
  }).el;
}

function verticalDemo(): HTMLElement {
  return onboardingDemo("vertical");
}

function nonLinearDemo(): HTMLElement {
  return Stepper({
    linear: false,
    defaultValue: "planning",
    steps: [
      { value: "planning", label: "Planning", content: para("Click any step header — non-linear mode lets you jump around.") },
      { value: "design", label: "Design", content: para("Design content.") },
      { value: "build", label: "Build", content: para("Build content.") },
      { value: "ship", label: "Ship", content: para("Ship content."), navigation: { submitLabel: "Done", onSubmit: () => undefined } },
    ],
  }).el;
}

function errorStateDemo(): HTMLElement {
  return Stepper({
    linear: false,
    defaultValue: "c",
    steps: [
      { value: "a", label: "Account", content: para("Account content.") },
      { value: "b", label: "Payment", description: "Card declined", status: "error", content: para("Payment content.") },
      {
        value: "c",
        label: "Confirmation",
        content: (() => {
          const wrap = document.createElement("div");
          const p = document.createElement("p");
          p.className = "zen-text-sm zen-py-4";
          p.textContent =
            'The Payment step has status "error"; its indicator turns red and the label uses --zen-color-error.';
          wrap.append(p);
          return wrap;
        })(),
      },
    ],
  }).el;
}

function programmaticDemo(): HTMLElement {
  const wrap = document.createElement("div");
  const caption = document.createElement("p");
  caption.className = "zen-text-xs zen-text-zen-muted-fg zen-mb-3";

  const stepper = Stepper({
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

  const controls = document.createElement("div");
  controls.className = "zen-flex zen-gap-2 zen-mt-4";
  controls.append(
    Button({ variant: "outline", color: "neutral", children: "Prev", onClick: () => stepper.prev() }).el,
    Button({ variant: "outline", color: "neutral", children: "Next", onClick: () => stepper.next() }).el,
    Button({ children: "Skip to review", onClick: () => stepper.goTo("review") }).el,
  );

  wrap.append(caption, stepper.el, controls);
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
        code: `Stepper({
  defaultValue: "a",
  steps: [
    { value: "a", label: "Welcome", content: "Welcome screen content." },
    { value: "b", label: "Profile", content: "Profile fields would go here." },
    { value: "c", label: "Done", content: "All done.",
      navigation: { submitLabel: "Finish", onSubmit: () => alert("Finished!") } },
  ],
});`,
        render: minimalDemo,
      },
      {
        title: "2. Onboarding flow with per-step validation",
        codeTitle: "Gate forward navigation on onBeforeNext",
        codeDescription:
          "Continue only fires when onBeforeNext returns true. The last step's onSubmit runs after its own validation. Panels stay mounted across navigation, so field values persist — the vanilla equivalent of React holding form state outside the DOM.",
        code: `Stepper({
  defaultValue: "basic",
  steps: [
    { value: "basic", label: "Basics", content: basicsFields,
      navigation: { onBeforeNext: () => nameOk && emailOk } },
    { value: "address", label: "Address", content: addressFields,
      navigation: { onBeforeNext: () => addressOk } },
    { value: "review", label: "Review", content: reviewBody,
      navigation: {
        submitLabel: "Submit application",
        onBeforeNext: () => agreed,
        onSubmit: async () => { await save(); showSubmitted(); },
      } },
  ],
});`,
        render: () => onboardingDemo("horizontal"),
      },
      {
        title: "3. Vertical orientation",
        codeTitle: 'orientation: "vertical"',
        codeDescription:
          "The list sits to the left of the panels; useful when the form is short per step but you want the full journey visible.",
        code: `Stepper({ orientation: "vertical", steps });`,
        render: verticalDemo,
      },
      {
        title: "4. Non-linear navigation",
        codeTitle: "linear: false — any header is clickable",
        codeDescription:
          "In linear mode (default) only completed + current steps are clickable. Setting linear: false lets the user jump to any step.",
        code: `Stepper({ linear: false, steps });`,
        render: nonLinearDemo,
      },
      {
        title: "5. Error state on a step",
        codeTitle: 'Override status: "error" on any step to surface a problem',
        codeDescription:
          "Useful when a downstream check fails (card declined, identity rejected) and you want the step header to flag it even after the user has moved past it.",
        code: `Stepper({
  linear: false,
  steps: [
    { value: "a", label: "Account" },
    { value: "b", label: "Payment", description: "Card declined", status: "error" },
    { value: "c", label: "Confirmation" },
  ],
});`,
        render: errorStateDemo,
      },
      {
        title: "6. Programmatic control via the handle",
        codeTitle: "Read + drive Stepper state from outside",
        codeDescription:
          "The returned handle is the same API React exposed through useStepper: currentIndex, isFirst, isLast, next(), prev(), goTo(value). A step's content function receives it too.",
        code: `const stepper = Stepper({ defaultValue: "welcome", steps });

skipBtn.addEventListener("click", () => stepper.goTo("review"));
caption.textContent = \`Step \${stepper.currentIndex + 1} of \${stepper.steps.length}\`;`,
        render: programmaticDemo,
      },
    ],
  });
}
