import { DemoPage } from "./demo-helpers";

/**
 * Paper demo — the web-components port. <zen-paper> is a declarative layer over
 * the vanilla factory, so the parts SLOT rather than being passed as data:
 * unlike Collapsible there is real compound content here, and authoring a
 * document as nested elements is the whole point of the custom-element form.
 */

type ZenDialog = HTMLElement & {
  open(): void;
  footer?: Node;
};

const BODY = `Every project starts with the same three questions, and we keep answering them in different places. This is an attempt to answer them once, in one document, that everyone can read end to end without opening four tabs.`;

const el = (tag: string, cls?: string, text?: string): HTMLElement => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  return n;
};

/** A ground to lay sheets on — the elevation needs something to sit against. */
const desk = (extra = ""): HTMLElement =>
  el("div", `zen-w-full zen-bg-zen-muted zen-p-8 ${extra}`.trim());

const paper = (attrs: Record<string, string>, ...kids: Node[]): HTMLElement => {
  const p = document.createElement("zen-paper");
  for (const [k, v] of Object.entries(attrs)) p.setAttribute(k, v);
  p.append(...kids);
  return p;
};

const part = (tag: string, ...kids: (Node | string)[]): HTMLElement => {
  const n = document.createElement(tag);
  n.append(...kids);
  return n;
};

export default function PaperDemo(): HTMLElement {
  return DemoPage({
    title: "Paper",
    description:
      "A document surface — a sheet you read, rather than a box you put things in. Card is the generic surface primitive; reach for Paper when the content is prose and the reading is the point. It brings the two things Card cannot express: a reading measure, and document typography.",
    sections: [
      {
        title: "1. A sheet on a desk",
        codeTitle: "Defaults: prose measure, raised, document padding",
        codeDescription:
          "Paper caps itself at a readable line length and centres, because a page lies on a desk rather than filling it. Put it on a bg-zen-muted ground to get the contact the shadow implies — with the sheet and the ground both painted background, the elevation has nothing to sit on.",
        code: `<zen-paper>
  <zen-paper-header>
    <zen-paper-title>Kickoff notes</zen-paper-title>
    <zen-paper-description>Rajesh · 14 August</zen-paper-description>
  </zen-paper-header>
  <zen-paper-content>Long-form content, capped at a readable line length.</zen-paper-content>
  <zen-paper-footer><zen-button size="sm">Reply</zen-button></zen-paper-footer>
</zen-paper>`,
        render: () => {
          const d = desk();
          const footer = part("zen-paper-footer");
          for (const [label, variant] of [
            ["Reply", ""],
            ["Archive", "ghost"],
          ]) {
            const b = document.createElement("zen-button");
            b.setAttribute("size", "sm");
            if (variant) b.setAttribute("variant", variant);
            b.textContent = label;
            footer.append(b);
          }
          d.append(
            paper(
              {},
              part(
                "zen-paper-header",
                part("zen-paper-title", "Kickoff notes"),
                part("zen-paper-description", "Rajesh · 14 August"),
              ),
              part("zen-paper-content", el("p", "zen-m-0", BODY)),
              footer,
            ),
          );
          return d;
        },
      },
      {
        title: "2. Measure is the point",
        codeTitle: "`measure` caps the sheet in ch, not px",
        codeDescription:
          "The cap is a line length, not a box: 65ch stays about 65 characters whatever the type scale does, which px cannot promise. This is the one property the paper THEME cannot give you — --zen-* reaches colour, radius, shadow and type, but the utility layer has no width or spacing tokens, so a max-width is a literal no override can reach.",
        code: `<zen-paper measure="prose">…</zen-paper>   <!-- 65ch — the default -->
<zen-paper measure="wide">…</zen-paper>    <!-- 80ch -->
<zen-paper measure="full">…</zen-paper>    <!-- fills its container -->`,
        render: () => {
          const d = desk("zen-flex zen-flex-col zen-gap-4");
          for (const m of ["prose", "wide", "full"]) {
            d.append(
              paper(
                { measure: m, padding: "sm" },
                part("zen-paper-content", el("p", "zen-m-0", `${m} — ${BODY}`)),
              ),
            );
          }
          return d;
        },
      },
      {
        title: "3. Elevation",
        codeTitle:
          "`raised` and `lifted` have no border — the shadow is the edge",
        codeDescription:
          "A hairline plus a shadow reads as a bordered card, which is the look this is trying not to be. `flat` is the opposite trade: a border and no shadow, for when sheets sit adjacent and a shadow between them would read as a gap.",
        code: `<zen-paper elevation="flat">…</zen-paper>
<zen-paper elevation="raised">…</zen-paper>   <!-- the default -->
<zen-paper elevation="lifted">…</zen-paper>`,
        render: () => {
          const d = desk("zen-grid zen-gap-6 sm:zen-grid-cols-3");
          for (const e of ["flat", "raised", "lifted"]) {
            d.append(
              paper(
                { elevation: e, measure: "full", padding: "sm" },
                part("zen-paper-content", e),
              ),
            );
          }
          return d;
        },
      },
      {
        title: "4. Padding is document margins",
        codeTitle: "Larger than Card's throughout — that is the point",
        code: `<zen-paper padding="none">…</zen-paper>
<zen-paper padding="sm">…</zen-paper>
<zen-paper padding="md">…</zen-paper>   <!-- the default -->
<zen-paper padding="lg">…</zen-paper>`,
        render: () => {
          const d = desk("zen-flex zen-flex-col zen-gap-4");
          for (const pad of ["sm", "md", "lg"]) {
            d.append(
              paper(
                { padding: pad, measure: "full" },
                part(
                  "zen-paper-content",
                  pad === "md" ? "md — the default" : pad,
                ),
              ),
            );
          }
          return d;
        },
      },
      {
        title: "5. A pile, not a sheet",
        codeTitle: "`stack` draws 1 or 2 sheet edges behind this one",
        codeDescription:
          "The affordance a column of separate Papers cannot express: this is a thread, and there are more. Decorative by construction — the edges are box-shadows, so nothing enters the DOM or the accessibility tree and a reader is never told the pile holds three documents when you rendered one. It composes with elevation: both live in one box-shadow list, because elevation already owns that property and a second utility would replace it rather than merge.",
        code: `<zen-paper stack="1">…</zen-paper>
<zen-paper stack="2">…</zen-paper>

<!-- composes with elevation -->
<zen-paper stack="2" elevation="lifted">…</zen-paper>`,
        render: () => {
          const d = desk("zen-grid zen-gap-8 sm:zen-grid-cols-3");
          d.append(
            paper(
              { measure: "full", padding: "sm" },
              part("zen-paper-content", "no stack"),
            ),
            paper(
              { measure: "full", padding: "sm", stack: "1" },
              part("zen-paper-content", "stack=1"),
            ),
            paper(
              {
                measure: "full",
                padding: "sm",
                stack: "2",
                elevation: "lifted",
              },
              part("zen-paper-content", "stack=2 + lifted"),
            ),
          );
          return d;
        },
      },
      {
        title: "6. A dialog that is a document",
        codeTitle: '<zen-dialog variant="paper">',
        codeDescription:
          "Not a restyle: a document is top-anchored. Centring a long sheet vertically and scrolling it inside 85vh puts the first line somewhere different on every screen. Paper mode drops the vertical centring, scrolls the viewport rather than the panel, and widens the cap. Pass nothing and Dialog is byte-identical to before.",
        code: `<zen-dialog variant="paper" title="Kickoff notes" description="Rajesh · 14 August">
  …
</zen-dialog>`,
        render: () => {
          const row = el("div", "zen-flex zen-flex-wrap zen-gap-2");

          // Deliberately taller than the viewport: a paper dialog that fits on
          // screen never exercises the scroll container, which is exactly how
          // the missing one went unnoticed.
          const long = el("div", "zen-text-base zen-leading-relaxed");
          for (let i = 0; i < 8; i++) long.append(el("p", undefined, BODY));

          const paperDialog = document.createElement("zen-dialog") as ZenDialog;
          paperDialog.setAttribute("variant", "paper");
          paperDialog.setAttribute("title", "Kickoff notes");
          paperDialog.setAttribute("description", "Rajesh · 14 August");
          paperDialog.append(long);

          const plainDialog = document.createElement("zen-dialog") as ZenDialog;
          plainDialog.setAttribute("title", "Settings");
          plainDialog.setAttribute(
            "description",
            "Update your profile information.",
          );
          plainDialog.append(
            el(
              "p",
              "zen-text-sm",
              "Centred, capped at max-w-lg, scrolls inside itself.",
            ),
          );

          const open = (label: string, dlg: ZenDialog, variant?: string) => {
            const b = document.createElement("zen-button");
            if (variant) b.setAttribute("variant", variant);
            b.textContent = label;
            b.addEventListener("click", () => dlg.open());
            return b;
          };

          row.append(
            paperDialog,
            plainDialog,
            open("Open a paper dialog", paperDialog),
            open("…and the default, unchanged", plainDialog, "outline"),
          );
          return row;
        },
      },
      {
        title: "7. Pairs with the paper theme, but does not need it",
        codeTitle: 'data-theme="paper" on any ancestor',
        codeDescription:
          "Paper sets its own leading and measure, so it reads the same under every theme. The paper THEME supplies what a component cannot reach globally: warm ground and sheet, cut corners, a contact shadow, and looser body leading. The two compound — that is the intended pairing, not a requirement.",
        code: `<div data-theme="paper">
  <zen-paper>…</zen-paper>
</div>`,
        render: () => {
          const grid = el(
            "div",
            "zen-w-full zen-grid zen-gap-6 sm:zen-grid-cols-2",
          );
          for (const theme of [null, "paper"]) {
            const cell = el("div", "zen-bg-zen-muted zen-p-6");
            if (theme) cell.setAttribute("data-theme", theme);
            cell.append(
              paper(
                { measure: "full", padding: "sm" },
                part(
                  "zen-paper-header",
                  part(
                    "zen-paper-title",
                    theme ? "Paper theme" : "Default theme",
                  ),
                ),
                part("zen-paper-content", el("p", "zen-m-0", BODY)),
              ),
            );
            grid.append(cell);
          }
          return grid;
        },
      },
    ],
  });
}
