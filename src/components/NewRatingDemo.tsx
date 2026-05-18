import { useState } from "react";
import { Rating } from "./survey/rating";
import { CodeExample } from "./demo-helpers";

const NewRatingDemo: React.FC = () => {
  const [stars, setStars] = useState(0);

  return (
    <div className="demo-page">
      <h1>Rating</h1>
      <p className="lede">
        5-star (or N-star) rating input. Hover preview tints stars up
        to the pointer; click commits. Click an already-selected star
        to clear (toggle via <code>allowClear</code>). Semantically a
        radiogroup so screen readers announce "1 of 5" / "2 of 5" on
        arrow-key nav.
      </p>

      <section className="demo-section">
        <h2>1. Default — uncontrolled</h2>
        <CodeExample
          title="defaultValue + listen via onValueChange"
          code={`<Rating
  defaultValue={0}
  onValueChange={(n) => console.log(n)}
  label="Rate the support agent"
/>`}
        >
          <Rating
            defaultValue={0}
            label="Rate the support agent"
            showValue
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Controlled</h2>
        <CodeExample
          title="value + onValueChange for external state"
          code={`const [stars, setStars] = useState(0);
<Rating value={stars} onValueChange={setStars} />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Rating
              value={stars}
              onValueChange={setStars}
              label="Rate your last delivery"
              showValue
            />
            <p className="text-xs text-zen-muted-fg m-0">
              Current rating: <code>{stars}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Sizes</h2>
        <CodeExample
          title='size="sm" | "md" | "lg"'
          code={`<Rating size="sm" defaultValue={3} />
<Rating size="md" defaultValue={3} />
<Rating size="lg" defaultValue={3} />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(["sm", "md", "lg"] as const).map((s) => (
              <div
                key={s}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <code
                  style={{
                    width: 50,
                    fontSize: "1.2rem",
                    color: "var(--zen-color-muted-fg)",
                  }}
                >
                  {s}
                </code>
                <Rating size={s} defaultValue={3} label={`Size ${s} demo`} />
              </div>
            ))}
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Custom max</h2>
        <CodeExample
          title="max changes the star count"
          description="Useful for 3-point feedback (good / mid / bad) or 10-point reviews."
          code={`<Rating max={3} defaultValue={2} />
<Rating max={10} defaultValue={7} size="sm" showValue />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Rating max={3} defaultValue={2} label="3-point rating" />
            <Rating
              max={10}
              defaultValue={7}
              size="sm"
              showValue
              label="10-point rating"
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Read-only (display)</h2>
        <CodeExample
          title="readOnly disables interaction but stays full opacity"
          description="Use when displaying an existing rating in a list or detail page."
          code={`<Rating value={4} readOnly />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Rating value={4} readOnly label="Driver rating" showValue />
            <Rating value={5} readOnly label="Product rating" showValue />
            <Rating value={2} readOnly label="Experience" showValue />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Disabled</h2>
        <CodeExample
          title="disabled + faded"
          code={`<Rating value={3} disabled />`}
        >
          <Rating value={3} disabled label="Locked rating" showValue />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewRatingDemo;
