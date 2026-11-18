import { DemoPage } from "./demo-helpers";

/**
 * Label demo — the web-components port. <zen-label> slots its text as light-DOM
 * children, because a label's content is the one thing a caller always writes
 * inline.
 *
 * `for` stays `for`: it is the attribute the DOM already has, and this binding
 * IS HTML. React renamed it to `htmlFor` only to dodge a JS reserved word.
 */

/**
 * The id goes on the INNER <input>, not on <zen-input>.
 *
 * Every zen element is a `display: contents` wrapper around the real control, and
 * `id` is not one of the attributes zen-input forwards inward. Setting it on the
 * host therefore leaves the id on a custom element, which is not a labelable
 * element — `<label for>` resolves to it and clicking the label focuses nothing.
 * Measured: getElementById returned ZEN-INPUT and the click was a no-op.
 *
 * So the id is assigned after the element upgrades and mounts, which happens in
 * connectedCallback — hence the rAF rather than doing it inline here.
 */
function nameInnerControl(host: HTMLElement, id: string): void {
  requestAnimationFrame(() => {
    const control = host.querySelector("input, textarea, select, button");
    if (control) control.id = id;
  });
}

function field(opts: {
  id: string;
  label: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
}): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "zen-space-y-1.5";
  wrap.style.width = "18rem";

  const label = document.createElement("zen-label");
  label.setAttribute("for", opts.id);
  if (opts.required) label.setAttribute("required", "");
  if (opts.disabled) label.setAttribute("disabled", "");
  label.textContent = opts.label;

  const input = document.createElement("zen-input");
  if (opts.placeholder) input.setAttribute("placeholder", opts.placeholder);
  if (opts.value) input.setAttribute("value", opts.value);
  if (opts.disabled) input.setAttribute("disabled", "");
  nameInnerControl(input, opts.id);

  wrap.append(label, input);
  return wrap;
}

export default function LabelDemo(): HTMLElement {
  return DemoPage({
    title: "Label",
    description:
      "The <label> for a control that is not inside a Form. Inside a Form, FormLabel is the right one — it reads the field context and wires the control id for you. This is the other half.",
    sections: [
      {
        title: "1. With a control",
        codeTitle: "for names the control",
        codeDescription:
          "Clicking the label focuses the input it names — the whole reason to use a <label> rather than a <span>.",
        code: `<zen-label for="email">Email</zen-label>
<zen-input placeholder="you@example.com"></zen-input>

// The id belongs on the inner control: <zen-input> is a display:contents
// wrapper and does not forward id, so an id on the host is an id on a
// custom element — which <label for> cannot focus.
zenInput.querySelector("input").id = "email";`,
        render: () => field({ id: "email", label: "Email", placeholder: "you@example.com" }),
      },
      {
        title: "2. Required",
        codeTitle: "required",
        codeDescription:
          "The asterisk is decoration — aria-hidden — because a bare '*' is not a word a screen reader conveys as 'required'. The requirement is stated in sr-only text beside it.",
        code: `<zen-label for="legal-name" required>Legal name</zen-label>`,
        render: () =>
          field({
            id: "legal-name",
            label: "Legal name",
            placeholder: "As printed on your passport",
            required: true,
          }),
      },
      {
        title: "3. Sizes",
        codeTitle: "sm / md / lg",
        codeDescription:
          "md is the default and matches FormLabel, so a page mixing bound and unbound fields stays on one type scale.",
        code: `<zen-label size="sm">Small</zen-label>
<zen-label size="md">Medium</zen-label>
<zen-label size="lg">Large</zen-label>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-items-baseline zen-gap-6";
          for (const [size, text] of [
            ["sm", "Small"],
            ["md", "Medium"],
            ["lg", "Large"],
          ] as const) {
            const l = document.createElement("zen-label");
            l.setAttribute("size", size);
            l.textContent = text;
            wrap.append(l);
          }
          return wrap;
        },
      },
      {
        title: "4. Beside a disabled control",
        codeTitle: "peer-disabled",
        codeDescription:
          "Checkbox is a real disableable element carrying zen-peer, so a sibling label dims with no prop. That does NOT hold in the Solid binding, where Kobalte nests its control — pass `disabled` when you need it to be portable.",
        code: `<zen-checkbox id="terms" disabled></zen-checkbox>
<zen-label for="terms">Accept the terms</zen-label>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-space-y-3";

          const row = (id: string, disabled: boolean) => {
            const r = document.createElement("div");
            r.className = "zen-flex zen-items-center zen-gap-2";

            const cb = document.createElement("zen-checkbox");
            if (disabled) cb.setAttribute("disabled", "");
            nameInnerControl(cb, id);

            const l = document.createElement("zen-label");
            l.setAttribute("for", id);
            l.textContent = "Accept the terms";

            r.append(cb, l);
            return r;
          };

          wrap.append(row("terms-on", false), row("terms-off", true));
          return wrap;
        },
      },
      {
        title: "5. Disabled",
        codeTitle: "disabled",
        codeDescription:
          "Dims the label. It disables nothing — a label takes no input. This is the portable way to dim one, since the peer rules above cannot fire in every binding.",
        code: `<zen-label for="frozen" disabled>Employee ID</zen-label>`,
        render: () =>
          field({ id: "frozen", label: "Employee ID", value: "EMP-0041", disabled: true }),
      },
    ],
  });
}
