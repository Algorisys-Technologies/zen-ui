import { DemoPage } from "./demo-helpers";

/**
 * Rating demo — the web-components port. <zen-rating> is a controlled number via
 * the `value` attribute; `zen-value-change` fires with the new number and the
 * caller re-applies it via `el.value = next`.
 */

function rating(attrs: Record<string, string>): HTMLElement {
  const r = document.createElement("zen-rating");
  for (const [k, v] of Object.entries(attrs)) r.setAttribute(k, v);
  return r;
}

export default function RatingDemo(): HTMLElement {
  return DemoPage({
    title: "Rating",
    description:
      '5-star (or N-star) rating input. Hover preview tints stars up to the pointer; click commits. Click an already-selected star to clear (toggle via allowClear). Semantically a radiogroup so screen readers announce "1 of 5" / "2 of 5" on arrow-key nav.',
    sections: [
      {
        title: "0. Half stars",
        codeTitle: "allow-half — each star becomes two options",
        codeDescription:
          "The stars stay whole; it is the options that halve. Each star grows a left and a right hit target, the arrow keys step by 0.5, and the radios announce '2.5 stars' rather than a bare number. Everything else — hover preview, click-to-clear, the radiogroup — is unchanged.",
        code: `<zen-rating value="2.5" allow-half size="lg" show-value label="Rate the venue"></zen-rating>

const r = document.querySelector("zen-rating");
r.addEventListener("zen-value-change", (e) => { r.value = e.detail; });`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "10px";

          const readout = document.createElement("p");
          readout.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";

          const r = rating({
            value: "2.5",
            "allow-half": "",
            size: "lg",
            "show-value": "",
            label: "Rate the venue",
          });
          const paint = () => (readout.textContent = `value → ${(r as unknown as { value: number }).value}`);
          r.addEventListener("zen-value-change", (e) => {
            (r as unknown as { value: number }).value = (e as CustomEvent).detail as number;
            paint();
          });
          paint();

          wrap.append(r, readout);
          return wrap;
        },
      },
      {
        title: "1. Default — uncontrolled",
        codeTitle: "default-value + listen via zen-value-change",
        code: `<zen-rating default-value="0" label="Rate the support agent" show-value></zen-rating>`,
        render: () =>
          rating({ "default-value": "0", label: "Rate the support agent", "show-value": "" }),
      },
      {
        title: "2. Controlled",
        codeTitle: "value + zen-value-change for external state",
        code: `<zen-rating value="0" label="Rate your last delivery" show-value></zen-rating>

r.addEventListener("zen-value-change", (e) => { r.value = e.detail; });`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";

          const readout = document.createElement("p");
          readout.className = "zen-text-xs zen-text-zen-muted-fg zen-m-0";

          const r = rating({ value: "0", label: "Rate your last delivery", "show-value": "" });
          const paint = () =>
            (readout.textContent = `Current rating: ${(r as unknown as { value: number }).value}`);
          r.addEventListener("zen-value-change", (e) => {
            (r as unknown as { value: number }).value = (e as CustomEvent).detail as number;
            paint();
          });
          paint();

          wrap.append(r, readout);
          return wrap;
        },
      },
      {
        title: "3. Sizes",
        codeTitle: 'size: "sm" | "md" | "lg"',
        code: `<zen-rating size="sm" default-value="3"></zen-rating>
<zen-rating size="md" default-value="3"></zen-rating>
<zen-rating size="lg" default-value="3"></zen-rating>`,
        render: () => {
          const col = document.createElement("div");
          col.style.display = "flex";
          col.style.flexDirection = "column";
          col.style.gap = "8px";

          for (const s of ["sm", "md", "lg"]) {
            const row = document.createElement("div");
            row.style.display = "flex";
            row.style.alignItems = "center";
            row.style.gap = "12px";

            const tag = document.createElement("code");
            tag.style.width = "50px";
            tag.style.fontSize = "0.75rem";
            tag.style.color = "var(--zen-color-muted-fg)";
            tag.textContent = s;

            row.append(tag, rating({ size: s, "default-value": "3", label: `Size ${s} demo` }));
            col.append(row);
          }
          return col;
        },
      },
      {
        title: "4. Custom max",
        codeTitle: "max changes the star count",
        codeDescription: "Useful for 3-point feedback (good / mid / bad) or 10-point reviews.",
        code: `<zen-rating max="3" default-value="2"></zen-rating>
<zen-rating max="10" default-value="7" size="sm" show-value></zen-rating>`,
        render: () => {
          const col = document.createElement("div");
          col.style.display = "flex";
          col.style.flexDirection = "column";
          col.style.gap = "12px";
          col.append(
            rating({ max: "3", "default-value": "2", label: "3-point rating" }),
            rating({
              max: "10",
              "default-value": "7",
              size: "sm",
              "show-value": "",
              label: "10-point rating",
            }),
          );
          return col;
        },
      },
      {
        title: "5. Read-only (display)",
        codeTitle: "read-only disables interaction but stays full opacity",
        codeDescription: "Use when displaying an existing rating in a list or detail page.",
        code: `<zen-rating value="4" read-only></zen-rating>`,
        render: () => {
          const col = document.createElement("div");
          col.style.display = "flex";
          col.style.flexDirection = "column";
          col.style.gap = "6px";
          col.append(
            rating({ value: "4", "read-only": "", label: "Driver rating", "show-value": "" }),
            rating({ value: "5", "read-only": "", label: "Product rating", "show-value": "" }),
            rating({ value: "2", "read-only": "", label: "Experience", "show-value": "" }),
          );
          return col;
        },
      },
      {
        title: "6. Disabled",
        codeTitle: "disabled + faded",
        code: `<zen-rating value="3" disabled></zen-rating>`,
        render: () =>
          rating({ value: "3", disabled: "", label: "Locked rating", "show-value": "" }),
      },
    ],
  });
}
