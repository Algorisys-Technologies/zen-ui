import { createSignal } from "solid-js";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./form/otp/otp";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewOTPDemo = () => {
  const [v, setV] = createSignal("");
  return (
    <DemoPage
      title="InputOTP"
      description="Segmented OTP input — one input per digit, zero dependencies. Handles paste, keyboard nav, autocomplete."
    >
      <DemoSection
        title="6 digits, with separator"
        codeTitle="Two 3-slot groups divided by a separator (like 123-456)"
        code={`const [v, setV] = createSignal("");

<InputOTP maxLength={6} value={v()} onValueChange={setV}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>`}
      >
        <InputOTP maxLength={6} value={v()} onChange={setV}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <div class="zen-text-xs zen-text-zen-muted-fg">Value: {v() || "—"}</div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewOTPDemo;
