import { createSignal, Show } from "solid-js";
import { Camera } from "./camera/camera";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewCameraDemo = () => {
  const [shot, setShot] = createSignal<string | null>(null);

  return (
    <DemoPage
      title="Camera"
      description="Webcam capture — no dependency to install. The React binding wraps react-webcam; Solid talks to navigator.mediaDevices.getUserMedia directly. Calls onCapture with a data-URL screenshot. Your browser will ask for camera permission, and a secure context (https or localhost) is required."
    >
      <DemoSection
        title="1. Capture a frame"
        codeTitle="onCapture → data URL"
        code={`const [shot, setShot] = createSignal<string | null>(null);

<Camera onCapture={setShot} facingMode="user" />`}
        previewStyle={{ "align-items": "flex-start", gap: "1rem" }}
      >
        <Camera onCapture={setShot} width={360} height={270} />
        <Show when={shot()}>
          {(src) => (
            <div class="zen-flex zen-flex-col zen-gap-1.5">
              <span class="zen-text-xs zen-text-zen-muted-fg">Captured</span>
              <img
                src={src()}
                alt="captured frame"
                class="zen-w-45 zen-rounded-zen-lg zen-border zen-border-zen-border"
              />
            </div>
          )}
        </Show>
      </DemoSection>
    </DemoPage>
  );
};

export default NewCameraDemo;
