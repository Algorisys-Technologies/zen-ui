import { NAV } from "../nav";
import { DemoPage } from "./demo-helpers";

export default function Welcome(): HTMLElement {
  const count = NAV.filter((g) => g.components !== false).flatMap((g) => g.items).length;
  return DemoPage({
    title: "Zen UI · Web Components",
    description: `${count} components, as native custom elements. A binding with no framework and no build step for the consumer — import once, write <zen-*> tags. Each element wraps the vanilla factory and mounts in the LIGHT dom, so the shared global zen-* / --zen-* stylesheet styles it exactly as in the React and Solid bindings.`,
    sections: [
      {
        title: "What this is",
        description:
          "The same design system as the React, Solid and vanilla bindings, with the same tokens, the same cn(), the same icon geometry and — for Button and Badge — literally the same variant object. A tag in your HTML, a real DOM node out, no framework runtime.",
        codeTitle: "the whole API shape",
        code: `import "@algorisys/zen-ui-web-components";        // registers every <zen-*>
import "@algorisys/zen-ui-web-components/styles";

// Declarative: write the tag anywhere HTML goes.
// <zen-button variant="solid" color="primary">Save</zen-button>

// Imperative properties + methods are forwarded onto the element:
const save = document.querySelector("zen-button");
save.loading = true;   // no re-render: a targeted DOM write`,
        render: () => document.createComment("no preview"),
      },
      {
        title: "What it cost",
        description:
          "A thin custom-element layer over the vanilla binding: defineZenElement() maps attributes and properties onto each factory, mounts its DOM in the light dom, and forwards the factory's handle methods onto the element. The eight vanilla src/lib modules — component contract, controlled/uncontrolled state, portal, focus trap, dismissable, scroll lock, roving focus, presence — do the real work underneath.",
        codeTitle: "zero runtime dependencies",
        codeDescription:
          "React externalises react + react-dom + five optional peers. Solid externalises solid-js + two. This package externalises nothing, because it depends on nothing at runtime but the DOM and the platform's Custom Elements.",
        code: `"peerDependencies": {}   // <- the whole point`,
        render: () => document.createComment("no preview"),
      },
    ],
  });
}
