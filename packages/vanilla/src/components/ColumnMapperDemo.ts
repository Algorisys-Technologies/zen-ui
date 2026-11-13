import { parseDelimited, type MapperField } from "@algorisys/zen-ui-core/column-mapper";
import { ColumnMapper } from "./column-mapper/column-mapper";
import { LocaleProvider } from "./locale/locale";
import { DemoPage } from "./demo-helpers";

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

function germanExport(): Node {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-4";

  const text = document.createElement("textarea");
  text.setAttribute("aria-label", "File contents");
  text.className =
    "zen-h-36 zen-w-full zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-p-2 zen-font-mono zen-text-xs zen-text-zen-foreground";
  text.value = export1;

  const out = document.createElement("p");
  out.className = "zen-m-0 zen-text-sm";
  out.dataset.testid = "onchange";
  out.textContent = "onChange: — (change a mapping)";

  // Built inside the provider's children function, so it reads de-DE.
  let mapper: ReturnType<typeof ColumnMapper> | undefined;
  const provider = LocaleProvider({
    locale: "de-DE",
    children: () => {
      mapper = ColumnMapper({
        rows: parseDelimited(text.value),
        fields,
        onChange: (_, c) => {
          out.textContent =
            "onChange: ok=" + c.ok + ", " + c.cellErrors.length + " cell errors, missing [" + c.missing.join(", ") + "]";
        },
        "data-testid": "mapper",
      });
      return mapper;
    },
  });
  text.addEventListener("input", () => mapper?.update({ rows: parseDelimited(text.value) }));

  wrap.append(text, provider.el, out);
  return wrap;
}

export default function ColumnMapperDemo(): HTMLElement {
  return DemoPage({
    title: "ColumnMapper",
    description:
      "Map a spreadsheet's columns onto your fields, and see what will import before it does. Columns are matched by name — the field's id, label or aliases — and never guessed beyond that: a wrong guess imports bad data silently, an unmapped column is merely visible.",
    sections: [
      {
        title: "1. A German ERP export",
        codeTitle: "parseDelimited, then fields with aliases",
        codeDescription: `The delimiter is detected (";"), the headers match through aliases (Auftrag, Material, Menge, Termin), and the remarks column is left unmapped. The locale is German, so "1.200,5" is a number and "20.11.2026" a date. Three cells will not import: an empty SKU, "viel" as a quantity, and 31 November. Edit the text to see it re-check.`,
        code: `const rows = parseDelimited(await file.text());

LocaleProvider({
  locale: "de-DE",
  children: () =>
    ColumnMapper({ rows, fields,
      onChange: (mapping, check) => setCanImport(check.ok) }),
}).el`,
        render: germanExport,
      },
    ],
  });
}
