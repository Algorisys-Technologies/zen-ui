import { Toaster, toast } from "./toast/toaster";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewToastDemo = () => (
  <DemoPage
    title="Toast"
    description="Transient notifications via solid-toast (port of react-hot-toast)."
  >
    <Toaster />
    <DemoSection
      title="Variants"
      codeTitle="Mount <Toaster /> once, then call toast() from anywhere"
      codeDescription="solid-toast exposes variants as methods on toast() rather than a variant prop. Per-call options (duration, position…) go in the second argument."
      code={`import { Toaster, toast } from "@algorisys/zen-ui-solid";

// Mount the Toaster once, near the root of your app:
<Toaster />

<Button onClick={() => toast("Saved")}>Default</Button>
<Button color="success" onClick={() => toast.success("Profile updated")}>
  Success
</Button>
<Button color="error" onClick={() => toast.error("Couldn't save")}>
  Error
</Button>
<Button
  variant="outline"
  onClick={() => toast.loading("Working on it…", { duration: 2500 })}
>
  Loading
</Button>`}
    >
      <Button onClick={() => toast("Saved")}>Default</Button>
      <Button color="success" onClick={() => toast.success("Profile updated")}>Success</Button>
      <Button color="error" onClick={() => toast.error("Couldn't save")}>Error</Button>
      <Button variant="outline" onClick={() => toast.loading("Working on it…", { duration: 2500 })}>
        Loading
      </Button>
    </DemoSection>
  </DemoPage>
);

export default NewToastDemo;
