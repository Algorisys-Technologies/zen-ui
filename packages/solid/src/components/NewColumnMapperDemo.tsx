import { createMemo, createSignal } from "solid-js";
import { ColumnMapper } from "./column-mapper/column-mapper";
import { LocaleProvider } from "./locale/locale";
import { parseDelimited, type MapperField, type MappingValidation } from "@algorisys/zen-ui-core/column-mapper";
import { DemoPage, DemoSection } from "./demo-helpers";

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

const NewColumnMapperDemo = () => {
  const [text, setText] = createSignal(export1);
  const rows = createMemo(() => parseDelimited(text()));
  const [check, setCheck] = createSignal<MappingValidation>();
  return (
    <DemoPage
      title="ColumnMapper"
      description={
        <>
          Map a spreadsheet's columns onto your fields, and see what will import before it does.
          Columns are matched by name — the field's id, label or aliases — and never guessed
          beyond that: a wrong guess imports bad data silently, an unmapped column is merely
          visible.
        </>
      }
    >
      <DemoSection
        title="1. A German ERP export"
        codeTitle="parseDelimited, then fields with aliases"
        codeDescription={
          <>
            The delimiter is detected (<code>;</code>), the headers match through aliases
            (Auftrag, Material, Menge, Termin), and the remarks column is left unmapped. The
            locale is German, so <code>1.200,5</code> is a number and <code>20.11.2026</code> a
            date. Three cells will not import: an empty SKU, "viel" as a quantity, and 31
            November. Edit the text to see it re-check.
          </>
        }
        code={`const rows = parseDelimited(await file.text());

<LocaleProvider locale="de-DE">
  <ColumnMapper rows={rows} fields={fields}
    onChange={(mapping, check) => setCanImport(check.ok)} />
</LocaleProvider>`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-4">
          <textarea
            aria-label="File contents"
            class="zen-h-36 zen-w-full zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-p-2 zen-font-mono zen-text-xs zen-text-zen-foreground"
            value={text()}
            onInput={(e) => setText(e.currentTarget.value)}
          />
          <LocaleProvider locale="de-DE">
            <ColumnMapper rows={rows()} fields={fields} onChange={(_, c) => setCheck(c)} data-testid="mapper" />
          </LocaleProvider>
          <p class="zen-m-0 zen-text-sm" data-testid="onchange">
            onChange: {check() ? `ok=${check()?.ok}, ${check()?.cellErrors.length} cell errors, missing [${check()?.missing.join(", ")}]` : "— (change a mapping)"}
          </p>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewColumnMapperDemo;
