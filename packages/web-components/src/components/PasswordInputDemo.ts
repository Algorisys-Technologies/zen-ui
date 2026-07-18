import { DemoPage } from "./demo-helpers";

function el(tag: string, attrs: Record<string, string> = {}, text?: string): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
}

export default function PasswordInputDemo(): HTMLElement {
  return DemoPage({
    title: "PasswordInput",
    description:
      "A password field with a show/hide toggle. The toggle is a real button — keyboard reachable, labelled, and aria-pressed reflects whether the value is visible — not an icon only a mouse can hit. It wraps a native input, so name, required, autocomplete and form submission all work unchanged.",
    sections: [
      {
        title: "Basic",
        codeTitle: "Defaults",
        code: `<zen-password-input placeholder="Password"></zen-password-input>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "320px";
          wrap.append(el("zen-password-input", { placeholder: "Password" }));
          return wrap;
        },
      },
      {
        title: "Controlled, with a strength hint",
        codeTitle: "zen-input event",
        code: `<zen-password-input placeholder="Choose a password" autocomplete="new-password"></zen-password-input>

pw.addEventListener("zen-input", (e) => update(e.detail.target.value));`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "320px";

          const hint = document.createElement("span");
          hint.className = "zen-block zen-mt-2 zen-text-sm zen-text-zen-muted-fg";
          hint.textContent = "At least 8 characters.";

          const pw = el("zen-password-input", {
            placeholder: "Choose a password",
            autocomplete: "new-password",
          });
          pw.addEventListener("zen-input", (e) => {
            const ev = (e as CustomEvent).detail as Event;
            const v = (ev.target as HTMLInputElement).value;
            const strong = v.length >= 8;
            hint.classList.toggle("zen-text-zen-success", strong);
            hint.classList.toggle("zen-text-zen-muted-fg", !strong);
            hint.textContent =
              v.length === 0 ? "At least 8 characters." : strong ? "Looks good." : `${8 - v.length} more to go.`;
          });

          wrap.append(pw, hint);
          return wrap;
        },
      },
      {
        title: "In a sign-in form",
        codeTitle: "Composes with zen-input and native form semantics",
        code: `<form>
  <zen-input type="email" placeholder="you@algorisys.com" autocomplete="username"></zen-input>
  <zen-password-input placeholder="Password" autocomplete="current-password" required></zen-password-input>
  <zen-button type="submit">Sign in</zen-button>
</form>`,
        render: () => {
          const form = document.createElement("form");
          form.className = "zen-grid zen-gap-2.5 zen-w-full";
          form.style.maxWidth = "320px";
          form.addEventListener("submit", (e) => e.preventDefault());
          form.append(
            el("zen-input", {
              type: "email",
              placeholder: "you@algorisys.com",
              autocomplete: "username",
            }),
            el("zen-password-input", {
              placeholder: "Password",
              autocomplete: "current-password",
              required: "",
            }),
            el("zen-button", { type: "submit" }, "Sign in"),
          );
          return form;
        },
      },
      {
        title: "Disabled",
        codeTitle: "disabled",
        code: `<zen-password-input disabled default-value="secret"></zen-password-input>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.width = "100%";
          wrap.style.maxWidth = "320px";
          wrap.append(el("zen-password-input", { disabled: "", "default-value": "secret" }));
          return wrap;
        },
      },
    ],
  });
}
