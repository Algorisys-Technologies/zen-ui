import {
  Paper,
  PaperHeader,
  PaperTitle,
  PaperDescription,
  PaperContent,
  PaperFooter,
} from "./paper/paper";
import { Dialog } from "./dialog/dialog";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

const BODY = `Every project starts with the same three questions, and we keep answering them in different places. This is an attempt to answer them once, in one document, that everyone can read end to end without opening four tabs.`;

/** A ground to lay sheets on — the elevation needs something to sit against. */
const desk = (...kids: Node[]): HTMLElement => {
  const d = document.createElement("div");
  d.className = "zen-w-full zen-bg-zen-muted zen-p-8";
  d.append(...kids);
  return d;
};

const para = (text: string): HTMLElement => {
  const p = document.createElement("p");
  p.className = "zen-m-0";
  p.textContent = text;
  return p;
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
        code: `Paper({ children: [
  PaperHeader({ children: [
    PaperTitle({ children: "Kickoff notes" }),
    PaperDescription({ children: "Rajesh · 14 August" }),
  ]}),
  PaperContent({ children: "Long-form content, capped at a readable line length." }),
  PaperFooter({ children: Button({ children: "Reply" }) }),
]})`,
        render: () =>
          desk(
            Paper({
              children: [
                PaperHeader({
                  children: [
                    PaperTitle({ children: "Kickoff notes" }).el,
                    PaperDescription({ children: "Rajesh · 14 August" }).el,
                  ],
                }).el,
                PaperContent({ children: para(BODY) }).el,
                PaperFooter({
                  children: [
                    Button({ children: "Reply", size: "sm" }).el,
                    Button({ children: "Archive", size: "sm", variant: "ghost" }).el,
                  ],
                }).el,
              ],
            }).el,
          ),
      },
      {
        title: "2. Measure is the point",
        codeTitle: "`measure` caps the sheet in ch, not px",
        codeDescription:
          "The cap is a line length, not a box: 65ch stays about 65 characters whatever the type scale does, which px cannot promise. This is the one property the paper THEME cannot give you — --zen-* reaches colour, radius, shadow and type, but the utility layer has no width or spacing tokens, so a max-width is a literal no override can reach.",
        code: `Paper({ measure: "prose" })   // 65ch — the default
Paper({ measure: "wide" })    // 80ch
Paper({ measure: "full" })    // fills its container`,
        render: () => {
          const wrap = desk();
          wrap.className += " zen-flex zen-flex-col zen-gap-4";
          for (const m of ["prose", "wide", "full"] as const) {
            wrap.append(
              Paper({
                measure: m,
                padding: "sm",
                children: PaperContent({ children: para(`${m} — ${BODY}`) }).el,
              }).el,
            );
          }
          return wrap;
        },
      },
      {
        title: "3. Elevation",
        codeTitle: "`raised` and `lifted` have no border — the shadow is the edge",
        codeDescription:
          "A hairline plus a shadow reads as a bordered card, which is the look this is trying not to be. `flat` is the opposite trade: a border and no shadow, for when sheets sit adjacent and a shadow between them would read as a gap.",
        code: `Paper({ elevation: "flat" })
Paper({ elevation: "raised" })   // the default
Paper({ elevation: "lifted" })`,
        render: () => {
          const wrap = desk();
          wrap.className += " zen-grid zen-gap-6 sm:zen-grid-cols-3";
          for (const e of ["flat", "raised", "lifted"] as const) {
            wrap.append(
              Paper({
                elevation: e,
                measure: "full",
                padding: "sm",
                children: PaperContent({ children: e }).el,
              }).el,
            );
          }
          return wrap;
        },
      },
      {
        title: "4. Padding is document margins",
        codeTitle: "Larger than Card's throughout — that is the point",
        code: `Paper({ padding: "none" })
Paper({ padding: "sm" })
Paper({ padding: "md" })   // the default
Paper({ padding: "lg" })`,
        render: () => {
          const wrap = desk();
          wrap.className += " zen-flex zen-flex-col zen-gap-4";
          for (const pad of ["sm", "md", "lg"] as const) {
            wrap.append(
              Paper({
                padding: pad,
                measure: "full",
                children: PaperContent({ children: pad === "md" ? "md — the default" : pad }).el,
              }).el,
            );
          }
          return wrap;
        },
      },
      {
        title: "5. A dialog that is a document",
        codeTitle: 'Dialog({ variant: "paper" })',
        codeDescription:
          "Not a restyle: a document is top-anchored. Centring a long sheet vertically and scrolling it inside 85vh puts the first line somewhere different on every screen. Paper mode drops the vertical centring, scrolls the viewport rather than the panel, and widens the cap. Pass nothing and Dialog is byte-identical to before.",
        code: `const doc = Dialog({
  variant: "paper",
  title: "Kickoff notes",
  description: "Rajesh · 14 August",
  children: body,
});
doc.open();`,
        render: () => {
          const row = document.createElement("div");
          row.className = "zen-flex zen-flex-wrap zen-gap-2";

          // Deliberately taller than the viewport: a paper dialog that fits on
          // screen never exercises the scroll container, which is exactly how
          // the missing one went unnoticed.
          const long = document.createElement("div");
          long.className = "zen-text-base zen-leading-relaxed";
          for (let i = 0; i < 8; i++) {
            const p = document.createElement("p");
            p.textContent = BODY;
            long.append(p);
          }

          const paperDialog = Dialog({
            variant: "paper",
            title: "Kickoff notes",
            description: "Rajesh · 14 August",
            children: long,
            footer: Button({ children: "Reply" }).el,
          });
          const plainDialog = Dialog({
            title: "Settings",
            description: "Update your profile information.",
            children: "Centred, capped at max-w-lg, scrolls inside itself.",
            footer: Button({ children: "Save" }).el,
          });

          row.append(
            Button({ children: "Open a paper dialog", onClick: () => paperDialog.open() }).el,
            Button({
              children: "…and the default, unchanged",
              variant: "outline",
              onClick: () => plainDialog.open(),
            }).el,
          );
          return row;
        },
      },
      {
        title: "6. Pairs with the paper theme, but does not need it",
        codeTitle: 'data-theme="paper" on any ancestor',
        codeDescription:
          "Paper sets its own leading and measure, so it reads the same under every theme. The paper THEME supplies what a component cannot reach globally: warm ground and sheet, cut corners, a contact shadow, and looser body leading. The two compound — that is the intended pairing, not a requirement.",
        code: `<div data-theme="paper">
  Paper({ … })
</div>`,
        render: () => {
          const grid = document.createElement("div");
          grid.className = "zen-w-full zen-grid zen-gap-6 sm:zen-grid-cols-2";
          for (const theme of [null, "paper"]) {
            const cell = document.createElement("div");
            cell.className = "zen-bg-zen-muted zen-p-6";
            if (theme) cell.setAttribute("data-theme", theme);
            cell.append(
              Paper({
                measure: "full",
                padding: "sm",
                children: [
                  PaperHeader({
                    children: PaperTitle({
                      children: theme ? "Paper theme" : "Default theme",
                    }).el,
                  }).el,
                  PaperContent({ children: para(BODY) }).el,
                ],
              }).el,
            );
            grid.append(cell);
          }
          return grid;
        },
      },
    ],
  });
}
