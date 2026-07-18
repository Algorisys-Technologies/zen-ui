import { Rating } from "./survey/rating";
import { DemoPage } from "./demo-helpers";

/**
 * Mirrors packages/react/src/components/NewRatingDemo.tsx — same seven sections
 * (Half stars, Uncontrolled, Controlled, Sizes, Custom max, Read-only, Disabled),
 * same behaviour, in the vanilla factory idiom.
 */
export default function RatingDemo(): HTMLElement {
  return DemoPage({
    title: "Rating",
    description:
      '5-star (or N-star) rating input. Hover preview tints stars up to the pointer; click commits. Click an already-selected star to clear (toggle via allowClear). Semantically a radiogroup so screen readers announce "1 of 5" / "2 of 5" on arrow-key nav.',
    sections: [
      {
        title: "0. Half stars",
        codeTitle: "allowHalf — each star becomes two options",
        codeDescription:
          "The stars stay whole; it is the options that halve. Each star grows a left and a right hit target, the arrow keys step by 0.5, and the radios announce '2.5 stars' rather than a bare number. Everything else — hover preview, click-to-clear, the radiogroup — is unchanged.",
        code: `let rating = 2.5;
const r = Rating({
  allowHalf: true,
  value: rating,
  size: "lg",
  showValue: true,
  label: "Rate the venue",
  onValueChange: (v) => { rating = v; r.update({ value: v }); },
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "10px";

          const readout = document.createElement("p");
          readout.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";

          let rating = 2.5;
          const r = Rating({
            allowHalf: true,
            value: rating,
            size: "lg",
            showValue: true,
            label: "Rate the venue",
            onValueChange: (v) => {
              rating = v;
              r.update({ value: v });
              readout.textContent = `value → ${rating}`;
            },
          });
          readout.textContent = `value → ${rating}`;

          wrap.append(r.el, readout);
          return wrap;
        },
      },
      {
        title: "1. Default — uncontrolled",
        codeTitle: "defaultValue + listen via onValueChange",
        code: `Rating({
  defaultValue: 0,
  label: "Rate the support agent",
  showValue: true,
  onValueChange: (n) => console.log(n),
})`,
        render: () =>
          Rating({
            defaultValue: 0,
            label: "Rate the support agent",
            showValue: true,
            onValueChange: (n) => console.log(n),
          }).el,
      },
      {
        title: "2. Controlled",
        codeTitle: "value + onValueChange for external state",
        code: `let stars = 0;
const r = Rating({
  value: stars,
  label: "Rate your last delivery",
  showValue: true,
  onValueChange: (v) => { stars = v; r.update({ value: v }); },
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";

          const readout = document.createElement("p");
          readout.className = "zen-text-xs zen-text-zen-muted-fg zen-m-0";

          let stars = 0;
          const r = Rating({
            value: stars,
            label: "Rate your last delivery",
            showValue: true,
            onValueChange: (v) => {
              stars = v;
              r.update({ value: v });
              readout.textContent = `Current rating: ${stars}`;
            },
          });
          readout.textContent = `Current rating: ${stars}`;

          wrap.append(r.el, readout);
          return wrap;
        },
      },
      {
        title: "3. Sizes",
        codeTitle: 'size: "sm" | "md" | "lg"',
        code: `Rating({ size: "sm", defaultValue: 3 })
Rating({ size: "md", defaultValue: 3 })
Rating({ size: "lg", defaultValue: 3 })`,
        render: () => {
          const col = document.createElement("div");
          col.style.display = "flex";
          col.style.flexDirection = "column";
          col.style.gap = "8px";

          for (const s of ["sm", "md", "lg"] as const) {
            const row = document.createElement("div");
            row.style.display = "flex";
            row.style.alignItems = "center";
            row.style.gap = "12px";

            const tag = document.createElement("code");
            tag.style.width = "50px";
            tag.style.fontSize = "0.75rem";
            tag.style.color = "var(--zen-color-muted-fg)";
            tag.textContent = s;

            row.append(tag, Rating({ size: s, defaultValue: 3, label: `Size ${s} demo` }).el);
            col.append(row);
          }
          return col;
        },
      },
      {
        title: "4. Custom max",
        codeTitle: "max changes the star count",
        codeDescription:
          "Useful for 3-point feedback (good / mid / bad) or 10-point reviews.",
        code: `Rating({ max: 3, defaultValue: 2 })
Rating({ max: 10, defaultValue: 7, size: "sm", showValue: true })`,
        render: () => {
          const col = document.createElement("div");
          col.style.display = "flex";
          col.style.flexDirection = "column";
          col.style.gap = "12px";
          col.append(
            Rating({ max: 3, defaultValue: 2, label: "3-point rating" }).el,
            Rating({
              max: 10,
              defaultValue: 7,
              size: "sm",
              showValue: true,
              label: "10-point rating",
            }).el,
          );
          return col;
        },
      },
      {
        title: "5. Read-only (display)",
        codeTitle: "readOnly disables interaction but stays full opacity",
        codeDescription:
          "Use when displaying an existing rating in a list or detail page.",
        code: `Rating({ value: 4, readOnly: true })`,
        render: () => {
          const col = document.createElement("div");
          col.style.display = "flex";
          col.style.flexDirection = "column";
          col.style.gap = "6px";
          col.append(
            Rating({ value: 4, readOnly: true, label: "Driver rating", showValue: true }).el,
            Rating({ value: 5, readOnly: true, label: "Product rating", showValue: true }).el,
            Rating({ value: 2, readOnly: true, label: "Experience", showValue: true }).el,
          );
          return col;
        },
      },
      {
        title: "6. Disabled",
        codeTitle: "disabled + faded",
        code: `Rating({ value: 3, disabled: true })`,
        render: () =>
          Rating({ value: 3, disabled: true, label: "Locked rating", showValue: true }).el,
      },
    ],
  });
}
