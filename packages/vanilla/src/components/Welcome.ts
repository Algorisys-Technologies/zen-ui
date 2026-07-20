import { NAV } from "../nav";
import { DemoPage, catalogue } from "./demo-helpers";

export default function Welcome(): HTMLElement {
  const count = NAV.filter((g) => g.components !== false).flatMap((g) => g.items).length;
  const page = DemoPage({
    title: "Zen UI · Vanilla",
    description: `${count} components, no framework. A binding with no render loop and no primitive library, built to test whether @algorisys/zen-ui-core is really framework-agnostic. It was not — see the accordion.`,
    sections: [
      {
        title: "What this is",
        description:
          "The same design system as the React and Solid bindings, with the same tokens, the same cn(), the same icon geometry and — for Button and Badge — literally the same variant object. Props in, a DOM node out.",
        codeTitle: "the whole API shape",
        code: `import { Button } from "@algorisys/zen-ui-vanilla";
import "@algorisys/zen-ui-vanilla/styles";

const save = Button({ variant: "solid", color: "primary", children: "Save" });
document.querySelector("#toolbar").append(save.el);

save.update({ loading: true });   // no re-render: a targeted DOM write
save.destroy();                   // releases listeners, portals, observers`,
        render: () => document.createComment("no preview"),
      },
      {
        title: "What it cost",
        description:
          "Eight modules in src/lib: the component contract, controlled/uncontrolled state, portal, focus trap, dismissable, scroll lock, roving focus, and presence. That list is the honest measure of what Radix and Kobalte were doing for the other two bindings.",
        codeTitle: "zero runtime dependencies",
        codeDescription:
          "React externalises react + react-dom + five optional peers. Solid externalises solid-js + two. This package externalises nothing, because it depends on nothing at runtime but the DOM.",
        code: `"peerDependencies": {}   // <- the whole point`,
        render: () => document.createComment("no preview"),
      },
    ],
  });

  // The component catalogue, rendered from the SAME nav the sidebar uses so the
  // two cannot drift — the React binding's landing page once kept its own copy
  // and fell 16 components behind. Appended rather than passed as a section
  // because it is a grid, not a code example.
  page.append(catalogue(NAV));
  return page;
}
