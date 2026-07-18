import { useState } from "react";
import { Camera } from "./camera/camera";
import { CodeExample } from "./demo-helpers";

const NewCameraDemo: React.FC = () => {
  const [shot, setShot] = useState<string | null>(null);

  return (
    <div className="demo-page">
      <h1>Camera</h1>
      <p className="lede">
        Webcam capture wrapping <code>react-webcam</code> (an{" "}
        <strong>optional</strong> peer dependency, lazy-loaded on first render).
        Calls <code>onCapture</code> with a data-URL screenshot. Your browser
        will ask for camera permission. Install <code>react-webcam</code> to use
        it.
      </p>

      <section className="demo-section">
        <h2>1. Capture a frame</h2>
        <CodeExample
          title="onCapture → data URL"
          code={`const [shot, setShot] = useState<string | null>(null);

<Camera onCapture={setShot} facingMode="user" />`}
        >
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
            <Camera onCapture={setShot} width={360} height={270} />
            {shot && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: "0.75rem", color: "var(--zen-color-muted-fg)" }}>
                  Captured
                </span>
                <img
                  src={shot}
                  alt="captured frame"
                  style={{ width: 180, borderRadius: 8, border: "1px solid var(--zen-color-border)" }}
                />
              </div>
            )}
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewCameraDemo;
