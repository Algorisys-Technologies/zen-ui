import { createSignal } from "solid-js";
import { SelectDialog, type SelectDialogItem } from "./select-dialog/select-dialog";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

/**
 * SelectDialog demo. Mirrors the React binding's sections. Every one drives real
 * state, because the point of the component is what comes back out of
 * `onConfirm` — a dialog that opens is not evidence that it picked anything.
 */

const SUPPLIERS: SelectDialogItem[] = [
  { id: "s1", label: "Nordwind Logistik", description: "Oslo, Norway", info: "Preferred", icon: "users" },
  { id: "s2", label: "Alpine Components", description: "Innsbruck, Austria", info: "Active", icon: "users" },
  { id: "s3", label: "Baltic Steel", description: "Gdansk, Poland", info: "Active", icon: "users" },
  { id: "s4", label: "Iberia Plastics", description: "Valencia, Spain", info: "On hold", icon: "users", disabled: true },
  { id: "s5", label: "Rhein Fittings", description: "Duisburg, Germany", info: "Active", icon: "users" },
  { id: "s6", label: "Loire Textiles", description: "Nantes, France", info: "Active", icon: "users" },
  { id: "s7", label: "Thames Instruments", description: "Reading, UK", info: "New", icon: "users" },
  { id: "s8", label: "Adria Marine", description: "Split, Croatia", info: "Active", icon: "users" },
];

const label = (id: string) => SUPPLIERS.find((s) => s.id === id)?.label ?? id;

const NewSelectDialogDemo = () => {
  const [singleOpen, setSingleOpen] = createSignal(false);
  const [supplier, setSupplier] = createSignal<string | null>(null);

  const [multiOpen, setMultiOpen] = createSignal(false);
  const [shortlist, setShortlist] = createSignal<string[]>(["s2", "s5"]);

  const [plainOpen, setPlainOpen] = createSignal(false);
  const [plain, setPlain] = createSignal<string | null>(null);

  return (
    <DemoPage
      title="SelectDialog"
      description="The list picker: a modal with a search field, a scrollable list and a footer. Single-select commits on click — picking is the answer, so there is no OK button. Multi-select draws checkboxes and defers everything to OK, so a mis-click costs nothing. Selection is drafted inside the dialog and only escapes through onConfirm."
    >
      <DemoSection
        title="1. Single select — the click is the answer"
        codeTitle="No OK button"
        codeDescription="Picking a row confirms and closes. Cancel is the only footer action, because OK would be a second click that says nothing new. The current selection is marked when the dialog re-opens."
        code={`const [open, setOpen] = createSignal(false);
const [supplier, setSupplier] = createSignal<string | null>(null);

<SelectDialog
  open={open()}
  onOpenChange={setOpen}
  title="Select supplier"
  description="Pick the supplier this order is raised against."
  items={SUPPLIERS}
  selectedIds={supplier() ? [supplier()!] : []}
  onConfirm={(ids) => setSupplier(ids[0])}
/>`}
      >
        <div class="zen-flex zen-flex-col zen-items-start zen-gap-2">
          <Button type="button" onClick={() => setSingleOpen(true)}>
            Select supplier
          </Button>
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            onConfirm → <code>{supplier() ? label(supplier()!) : "—"}</code>
          </p>
          <SelectDialog
            open={singleOpen()}
            onOpenChange={setSingleOpen}
            title="Select supplier"
            description="Pick the supplier this order is raised against."
            items={SUPPLIERS}
            selectedIds={supplier() ? [supplier()!] : []}
            onConfirm={(ids) => setSupplier(ids[0])}
          />
        </div>
      </DemoSection>

      <DemoSection
        title="2. Multi select — nothing commits until OK"
        codeTitle="multiple + Clear"
        codeDescription="Checkbox rows, and a Clear that is disabled while the draft is empty. Cancel restores whatever was selected when the dialog opened — the ticks you made in between are thrown away, which is the whole point of a draft."
        code={`const [shortlist, setShortlist] = createSignal<string[]>(["s2", "s5"]);

<SelectDialog
  multiple
  open={open()}
  onOpenChange={setOpen}
  title="Shortlist suppliers"
  items={SUPPLIERS}
  selectedIds={shortlist()}
  onConfirm={setShortlist}
/>`}
      >
        <div class="zen-flex zen-flex-col zen-items-start zen-gap-2">
          <Button type="button" onClick={() => setMultiOpen(true)}>
            Shortlist suppliers ({shortlist().length})
          </Button>
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            onConfirm → <code>{shortlist().map(label).join(", ") || "—"}</code>
          </p>
          <SelectDialog
            multiple
            open={multiOpen()}
            onOpenChange={setMultiOpen}
            title="Shortlist suppliers"
            description="Everything ticked here is committed on OK, not before."
            items={SUPPLIERS}
            selectedIds={shortlist()}
            onConfirm={setShortlist}
          />
        </div>
      </DemoSection>

      <DemoSection
        title="3. Without search, and the empty state"
        codeTitle="searchable={false}"
        codeDescription="For a short, fixed list a search field is furniture. Type a query that matches nothing in the sections above to see emptyText instead."
        code={`<SelectDialog
  searchable={false}
  emptyText="No suppliers match that name"
  open={open()}
  onOpenChange={setOpen}
  title="Select region"
  items={REGIONS}
  onConfirm={(ids) => setRegion(ids[0])}
/>`}
      >
        <div class="zen-flex zen-flex-col zen-items-start zen-gap-2">
          <Button type="button" variant="outline" color="neutral" onClick={() => setPlainOpen(true)}>
            Select region
          </Button>
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            onConfirm → <code>{plain() ?? "—"}</code>
          </p>
          <SelectDialog
            searchable={false}
            open={plainOpen()}
            onOpenChange={setPlainOpen}
            title="Select region"
            items={[
              { id: "emea", label: "EMEA", description: "Europe, Middle East, Africa" },
              { id: "amer", label: "Americas", description: "North + South America" },
              { id: "apac", label: "APAC", description: "Asia Pacific" },
            ]}
            selectedIds={plain() ? [plain()!] : []}
            onConfirm={(ids) => setPlain(ids[0])}
          />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewSelectDialogDemo;
