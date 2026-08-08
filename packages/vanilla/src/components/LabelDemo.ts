import { Label } from "./form/label/label";
import { Input } from "./form/input/input";
import { Checkbox } from "./form/checkbox/checkbox";
import { DemoPage } from "./demo-helpers";

export default function LabelDemo(): HTMLElement {
  return DemoPage({
    title: "Label",
    description:
      "The <label> for a control that is not inside a Form. Inside a Form, FormLabel is the right one — it reads the field context and wires the control id for you. This is the other half. Note `for`, not React's `htmlFor`: this binding writes attributes, so it keeps the DOM's own name.",
    sections: [
      {
        title: "1. With a control",
        codeTitle: "for names the control",
        codeDescription:
          "Clicking the label focuses the input it names — the whole reason to use a <label> rather than a <span>.",
        code: `Label({ for: "email", children: "Email" })
Input({ id: "email", type: "email", placeholder: "you@example.com" })`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-space-y-1.5";
          wrap.style.width = "18rem";
          wrap.append(
            Label({ for: "email", children: "Email" }).el,
            Input({ id: "email", type: "email", placeholder: "you@example.com" }).el,
          );
          return wrap;
        },
      },
      {
        title: "2. Required",
        codeTitle: "required",
        codeDescription:
          "The asterisk is decoration — aria-hidden — because a bare '*' is not a word a screen reader conveys as 'required'. The requirement is stated in sr-only text beside it.",
        code: `Label({ for: "legal-name", required: true, children: "Legal name" })`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-space-y-1.5";
          wrap.style.width = "18rem";
          wrap.append(
            Label({ for: "legal-name", required: true, children: "Legal name" }).el,
            Input({ id: "legal-name", placeholder: "As printed on your passport" }).el,
          );
          return wrap;
        },
      },
      {
        title: "3. Sizes",
        codeTitle: "sm / md / lg",
        codeDescription:
          "md is the default and matches FormLabel, so a page mixing bound and unbound fields stays on one type scale.",
        code: `Label({ size: "sm", children: "Small" })
Label({ size: "md", children: "Medium" })
Label({ size: "lg", children: "Large" })`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-items-baseline zen-gap-6";
          wrap.append(
            Label({ size: "sm", children: "Small" }).el,
            Label({ size: "md", children: "Medium" }).el,
            Label({ size: "lg", children: "Large" }).el,
          );
          return wrap;
        },
      },
      {
        title: "4. Beside a disabled control",
        codeTitle: "peer-disabled",
        codeDescription:
          "Checkbox is a real disableable element carrying zen-peer, so a sibling label dims with no prop. That does NOT hold in the Solid binding, where Kobalte nests its control inside a wrapper — pass `disabled` when you need it to be portable.",
        code: `Checkbox({ id: "terms", disabled: true })
Label({ for: "terms", children: "Accept the terms" })`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-space-y-3";

          const row = (id: string, disabled: boolean) => {
            const r = document.createElement("div");
            r.className = "zen-flex zen-items-center zen-gap-2";
            r.append(
              Checkbox({ id, disabled }).el,
              Label({ for: id, children: "Accept the terms" }).el,
            );
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
        code: `Label({ for: "frozen", disabled: true, children: "Employee ID" })`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-space-y-1.5";
          wrap.style.width = "18rem";
          wrap.append(
            Label({ for: "frozen", disabled: true, children: "Employee ID" }).el,
            Input({ id: "frozen", value: "EMP-0041", disabled: true }).el,
          );
          return wrap;
        },
      },
    ],
  });
}
