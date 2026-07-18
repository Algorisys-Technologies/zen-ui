import { createSignal } from "solid-js";
import { PasswordInput } from "./form/password-input/password-input";
import { Input } from "./form/input/input";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const PasswordInputDemo = () => {
  const [pw, setPw] = createSignal("");
  const strong = () => pw().length >= 8;

  return (
    <DemoPage
      title="PasswordInput"
      description="A password field with a show/hide toggle. The toggle is a real button — keyboard reachable, labelled, and aria-pressed reflects whether the value is visible — not an icon only a mouse can hit. It wraps a native input, so name, required, autocomplete and form submission all work unchanged."
    >
      <DemoSection title="Basic" codeTitle="Defaults" code={`<PasswordInput placeholder="Password" />`}>
        <div class="zen-w-full" style={{ "max-width": "320px" }}>
          <PasswordInput placeholder="Password" />
        </div>
      </DemoSection>

      <DemoSection
        title="Controlled, with a strength hint"
        codeTitle="value + onInput"
        code={`const [pw, setPw] = createSignal("");
<PasswordInput value={pw()} onInput={(e) => setPw(e.currentTarget.value)} />`}
      >
        <div class="zen-w-full" style={{ "max-width": "320px" }}>
          <PasswordInput
            value={pw()}
            onInput={(e) => setPw(e.currentTarget.value)}
            placeholder="Choose a password"
            autocomplete="new-password"
          />
          <span
            class="zen-block zen-mt-2 zen-text-sm"
            classList={{ "zen-text-zen-success": strong(), "zen-text-zen-muted-fg": !strong() }}
          >
            {pw().length === 0 ? "At least 8 characters." : strong() ? "Looks good." : `${8 - pw().length} more to go.`}
          </span>
        </div>
      </DemoSection>

      <DemoSection
        title="In a sign-in form"
        codeTitle="Composes with Input and native form semantics"
        code={`<form>
  <Input type="email" placeholder="you@algorisys.com" autocomplete="username" />
  <PasswordInput placeholder="Password" autocomplete="current-password" required />
  <Button type="submit">Sign in</Button>
</form>`}
      >
        <form
          onSubmit={(e) => e.preventDefault()}
          class="zen-grid zen-gap-2.5 zen-w-full"
          style={{ "max-width": "320px" }}
        >
          <Input type="email" placeholder="you@algorisys.com" autocomplete="username" />
          <PasswordInput placeholder="Password" autocomplete="current-password" required />
          <Button type="submit">Sign in</Button>
        </form>
      </DemoSection>

      <DemoSection title="Disabled" codeTitle="disabled" code={`<PasswordInput disabled value="secret" />`}>
        <div class="zen-w-full" style={{ "max-width": "320px" }}>
          <PasswordInput disabled value="secret" />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default PasswordInputDemo;
