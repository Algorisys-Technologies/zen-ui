import { useMemo, useState } from "react";
import { ColumnMapper } from "./column-mapper/column-mapper";
import { LocaleProvider } from "./locale/locale";
import { parseDelimited, type MapperField, type MappingValidation } from "@algorisys/zen-ui-core/column-mapper";
import { CodeExample } from "./demo-helpers";

const fields: MapperField[] = [
  { id: "order", label: "Work order", required: true, aliases: ["auftrag", "wo"] },
  { id: "sku", label: "SKU", required: true, aliases: ["item code", "material", "artikel"] },
  { id: "qty", label: "Quantity", type: "number", required: true, aliases: ["menge"] },
  { id: "due", label: "Due date", type: "date", aliases: ["termin"] },
  { id: "line", label: "Line" },
];

// A German ERP export: ';' between columns, ',' as the decimal mark,
// dd.mm.yyyy dates — and two bad cells.
const export1 = `Auftrag;Material;Menge;Termin;Bemerkung
WO-10042;BR-4471;500;20.11.2026;
WO-10043;HP-2210;1.200,5;21.11.2026;Eilt
WO-10044;;300;22.11.2026;
WO-10045;CV-0090;viel;23.11.2026;
WO-10046;BR-4471;250;31.11.2026;`;

const NewColumnMapperDemo: React.FC = () => {
  const [text, setText] = useState(export1);
  const rows = useMemo(() => parseDelimited(text), [text]);
  const [check, setCheck] = useState<MappingValidation>();
  return (
    <div className="demo-page">
      <h1>ColumnMapper</h1>
      <p className="lede">
        Map a spreadsheet's columns onto your fields, and see what will import before it does.
        Columns are matched by name — the field's id, label or aliases — and never guessed
        beyond that: a wrong guess imports bad data silently, an unmapped column is merely
        visible.
      </p>

      <section className="demo-section">
        <h2>1. A German ERP export</h2>
        <CodeExample
          title="parseDelimited, then fields with aliases"
          description={`The delimiter is detected (";"), the headers match through aliases (Auftrag, Material, Menge, Termin), and the remarks column is left unmapped. The locale is German, so "1.200,5" is a number and "20.11.2026" a date. Three cells will not import: an empty SKU, "viel" as a quantity, and 31 November. Edit the text to see it re-check.`}
          code={`const rows = parseDelimited(await file.text());

<LocaleProvider locale="de-DE">
  <ColumnMapper rows={rows} fields={fields}
    onChange={(mapping, check) => setCanImport(check.ok)} />
</LocaleProvider>`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-4">
            <textarea
              aria-label="File contents"
              className="zen-h-36 zen-w-full zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-p-2 zen-font-mono zen-text-xs zen-text-zen-foreground"
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
            />
            <LocaleProvider locale="de-DE">
              <ColumnMapper rows={rows} fields={fields} onChange={(_, c) => setCheck(c)} data-testid="mapper" />
            </LocaleProvider>
            <p className="zen-m-0 zen-text-sm" data-testid="onchange">
              onChange:{" "}
              {check
                ? `ok=${check.ok}, ${check.cellErrors.length} cell errors, missing [${check.missing.join(", ")}]`
                : "— (change a mapping)"}
            </p>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewColumnMapperDemo;
