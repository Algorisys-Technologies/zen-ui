import { PasswordInput } from "./form/password-input/password-input";
import { Input } from "./form/input/input";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

export default function PasswordInputDemo(): HTMLElement {
  return DemoPage({
    title: "PasswordInput",
    description:
      "A password field with a show/hide toggle. The toggle is a real button — keyboard reachable, labelled, and aria-pressed reflects whether the value is visible — not an icon only a mouse can hit. It wraps a native input, so name, required, autocomplete and form submission all work unchanged.",
    sections: [
      {
        title: "Basic",
        codeTitle: "Defaults",
        code: `const pw = PasswordInput({ placeholder: "Password" });\ndocument.body.append(pw.el);`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "320px";
          wrap.append(PasswordInput({ placeholder: "Password" }).el);
          return wrap;
        },
      },
      {
        title: "Controlled, with a strength hint",
        codeTitle: "value + onInput",
        code: `PasswordInput({\n  placeholder: "Choose a password",\n  onInput: (e) => update((e.target).value),\n});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "320px";

          const hint = document.createElement("span");
          hint.className = "zen-block zen-mt-2 zen-text-sm zen-text-zen-muted-fg";
          hint.textContent = "At least 8 characters.";

          const pw = PasswordInput({
            placeholder: "Choose a password",
            autocomplete: "new-password",
            onInput: (e) => {
              const v = (e.target as HTMLInputElement).value;
              const strong = v.length >= 8;
              hint.classList.toggle("zen-text-zen-success", strong);
              hint.classList.toggle("zen-text-zen-muted-fg", !strong);
              hint.textContent = v.length === 0 ? "At least 8 characters." : strong ? "Looks good." : `${8 - v.length} more to go.`;
            },
          });

          wrap.append(pw.el, hint);
          return wrap;
        },
      },
      {
        title: "In a sign-in form",
        codeTitle: "Composes with Input and native form semantics",
        code: `const form = document.createElement("form");\nform.append(\n  Input({ type: "email", placeholder: "you@algorisys.com", autocomplete: "username" }).el,\n  PasswordInput({ placeholder: "Password", autocomplete: "current-password", required: true }).el,\n  Button({ type: "submit", children: "Sign in" }).el,\n);`,
        render: () => {
          const form = document.createElement("form");
          form.className = "zen-grid zen-gap-2.5 zen-w-full";
          form.style.maxWidth = "320px";
          form.addEventListener("submit", (e) => e.preventDefault());
          form.append(
            Input({ type: "email", placeholder: "you@algorisys.com", autocomplete: "username" }).el,
            PasswordInput({ placeholder: "Password", autocomplete: "current-password", required: true }).el,
            Button({ type: "submit", children: "Sign in" }).el,
          );
          return form;
        },
      },
      {
        title: "Disabled",
        codeTitle: "disabled",
        code: `PasswordInput({ disabled: true, defaultValue: "secret" });`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "320px";
          wrap.append(PasswordInput({ disabled: true, defaultValue: "secret" }).el);
          return wrap;
        },
      },
    ],
  });
}
