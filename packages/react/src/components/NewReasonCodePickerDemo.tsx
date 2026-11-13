import { useState } from "react";
import { ReasonCodePicker } from "./reason-code-picker/reason-code-picker";
import type { ReasonCode } from "@algorisys/zen-ui-core/reason-codes";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const downtime: ReasonCode[] = [
  { id: "m12", code: "M12", label: "Hydraulic pressure low", category: "Mechanical" },
  { id: "m07", code: "M07", label: "Tool breakage", category: "Mechanical" },
  { id: "m03", code: "M03", label: "Jam at infeed", category: "Mechanical" },
  { id: "m21", code: "M21", label: "Lubrication alarm", category: "Mechanical" },
  { id: "e02", code: "E02", label: "Power loss", category: "Electrical" },
  { id: "e05", code: "E05", label: "Sensor fault", category: "Electrical", description: "Light curtain or proximity sensor not reading" },
  { id: "e09", code: "E09", label: "Drive overload", category: "Electrical" },
  { id: "s01", code: "S01", label: "No blanks", category: "Supply" },
  { id: "s04", code: "S04", label: "Waiting for crane", category: "Supply" },
  { id: "s06", code: "S06", label: "Packaging material out", category: "Supply" },
  { id: "q01", code: "Q01", label: "First-off inspection", category: "Quality" },
  { id: "q03", code: "Q03", label: "Dimension out of tolerance", category: "Quality", description: "Measured outside the drawing limits" },
  { id: "o01", code: "O01", label: "No operator", category: "Organisational" },
  { id: "o02", code: "O02", label: "Shift handover", category: "Organisational" },
  { id: "o05", code: "O05", label: "Meeting / training", category: "Organisational" },
];

const scrap: ReasonCode[] = [
  { id: "burr", label: "Burr" },
  { id: "scratch", label: "Scratch" },
  { id: "crack", label: "Crack" },
  { id: "dim", label: "Wrong dimension" },
  { id: "other", label: "Other" },
];

const NewReasonCodePickerDemo: React.FC = () => {
  const [reason, setReason] = useState<string | undefined>("e05");
  const [saved, setSaved] = useState<string>();
  return (
    <div className="demo-page">
      <h1>ReasonCodePicker</h1>
      <p className="lede">
        A touch grid for saying why — why a machine stopped, why a part was scrapped.
        Targets are at least 48px for gloved hands; category chips and a search box appear
        when the list is long enough to need them.
      </p>

      <section className="demo-section">
        <h2>1. Downtime reasons</h2>
        <CodeExample
          title="reasons, value, onChange"
          description="Search matches the label, the code and the description, every word in any order, ignoring accents — try “m12”, “sensor” or “low hyd”. Arrow keys move through the grid without choosing; Enter or Space chooses. Filter the selected reason out of view and it stays selected, named under the grid."
          code={`const [reason, setReason] = useState<string>();

<ReasonCodePicker
  label="Why did Press 5 stop?"
  reasons={downtimeReasons}
  value={reason}
  onChange={setReason}
/>`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-3">
            <ReasonCodePicker label="Why did Press 5 stop?" reasons={downtime} value={reason} onChange={(id) => setReason(id)} />
            <div className="zen-flex zen-items-center zen-gap-3">
              <Button disabled={!reason} onClick={() => setSaved(reason)}>
                Record stop
              </Button>
              {saved && (
                <span className="zen-text-sm" role="status">
                  Recorded: {downtime.find((r) => r.id === saved)?.label}
                </span>
              )}
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. A short list</h2>
        <CodeExample
          title="no categories and few reasons: no chips, no search"
          code={`<ReasonCodePicker label="Scrap reason" reasons={scrapReasons} onChange={record} />`}
        >
          <ReasonCodePicker className="zen-max-w-xl" label="Scrap reason" reasons={scrap} />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewReasonCodePickerDemo;
