/**
 * Generates AGENTS.md — the guide an LLM coding agent reads when it CONSUMES
 * zen-ui, so it picks the right component and the right binding instead of
 * inventing one or reaching for a divergent name.
 *
 * Why generated, not hand-written: the catalogue is exactly the "which
 * component is right" map, and its single source of truth already exists —
 * `packages/react/src/nav.ts`, whose `description` field is the reference
 * binding's one-line "what it is for". A hand-kept second copy would drift the
 * way the landing page once drifted 16 entries from the sidebar. So this reads
 * nav.ts (the reference binding wins, per scripts/bindings.mjs) and re-emits
 * the guide; nothing is typed twice.
 *
 * It writes FIVE files from that one source:
 *   - AGENTS.md at the repo root — for an agent working in this repo, and the
 *     canonical copy.
 *   - packages/<binding>/AGENTS.md — one per binding, so a consumer's agent
 *     finds it in node_modules. Each carries that binding's own consume-idiom
 *     header (JSX vs factory vs custom element) above the shared catalogue.
 *     These are in each package's `files` allowlist, so they publish.
 *
 * Usage:
 *   bun run scripts/gen-agent-guide.ts            # write the files
 *   bun run scripts/gen-agent-guide.ts --check    # assert they are in sync (CI)
 *
 * The --check mode is wired into `bun run check`. It regenerates in memory and
 * diffs against disk, so a component added to nav.ts without regenerating this
 * fails the same gate as any other drift — that is the "kept updated" contract.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { NAV, type NavGroup } from "../packages/react/src/nav.ts";
import { BINDINGS } from "./bindings.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * How each binding is actually consumed. React is the reference; the others are
 * one design system with a different renderer. The example is the SAME Button,
 * so a reader sees precisely what changes between bindings and nothing else.
 */
const IDIOM: Record<string, { renderer: string; example: string }> = {
  react: {
    renderer: "JSX components (Radix-backed). This is the reference API.",
    example: `import { Button } from "@algorisys/zen-ui-react";
import "@algorisys/zen-ui-react/styles";

<Button variant="solid" color="primary">Save</Button>;`,
  },
  solid: {
    renderer: "JSX components (Kobalte-backed). Mirrors the React API.",
    example: `import { Button } from "@algorisys/zen-ui-solid";
import "@algorisys/zen-ui-solid/styles";

<Button variant="solid" color="primary">Save</Button>;`,
  },
  vanilla: {
    renderer:
      "Framework-free factories. Each factory takes a props object and returns a handle whose `.el` is the DOM node. No JSX, no compound child components — a family is one data-driven factory.",
    example: `import { Button } from "@algorisys/zen-ui-vanilla";
import "@algorisys/zen-ui-vanilla/styles";

const btn = Button({ variant: "solid", color: "primary", children: "Save" });
document.body.append(btn.el);`,
  },
  "web-components": {
    renderer:
      "Native custom elements over the vanilla factories. Importing the package registers every <zen-*> element as a side effect; it also re-exports the vanilla factories, so either style works.",
    example: `import "@algorisys/zen-ui-web-components";        // registers every <zen-*> element
import "@algorisys/zen-ui-web-components/styles";

<zen-button variant="solid" color="primary">Save</zen-button>`,
  },
};

/** Groups that describe components a consumer picks from. `catalogue: false` is
 *  sidebar-only chrome (Getting started); we skip it. Patterns stay in — they
 *  are compositions, and an agent choosing "how do I build a list report" wants
 *  them — but are flagged so nobody imports one as a component. */
const catalogueGroups = (): NavGroup[] => NAV.filter((g) => g.catalogue !== false);

const renderCatalogue = (): string => {
  const parts: string[] = [];
  for (const group of catalogueGroups()) {
    const composed = group.components === false;
    parts.push(`### ${group.title}${composed ? " (compositions, not exported components)" : ""}`);
    parts.push("");
    for (const item of group.items) {
      // Getting-started aside: items without a description are routes, not
      // components (Welcome, Customizing). They live in a skipped group anyway.
      if (!item.description) continue;
      parts.push(`- **${item.label}** — ${item.description}`);
    }
    parts.push("");
  }
  return parts.join("\n").trimEnd();
};

const DIVERGENCES = `## Binding divergences an agent must know

The bindings are one API with four renderers, but three differences are
structural — reaching for the React shape in another binding is a bug, not a
missing export:

- **Compound parts exist only in React and Solid.** \`DialogContent\`,
  \`TabsList\`, \`AccordionItem\`, \`SelectTrigger\` and the like are child
  components you compose. The **vanilla** and **web-components** bindings expose
  each family as ONE factory (or one \`<zen-*>\` element) that takes data — there
  is nothing to name the parts. Do not import \`DialogContent\` from
  \`@algorisys/zen-ui-vanilla\`; it does not exist by design.
- **Select.** React exports the Radix compound parts
  (\`SelectTrigger\`, \`SelectContent\`, \`SelectItem\`, …). Solid, vanilla and
  web-components export a single \`Select\` that takes an \`options\` array.
- **Toast.** React wraps Radix Toast primitives; Solid uses solid-toast. Both
  expose an imperative \`toast()\` plus a viewport, but the primitive API differs.`;

const RULES = `## Rules that apply in every binding

- **You must import the stylesheet.** \`import "<pkg>/styles";\` once at your
  app entry. Without it, components render unstyled — utilities resolve to
  nothing. An optional element reset is a separate opt-in: \`import "<pkg>/preflight";\`.
- **Utilities are prefixed \`zen-\`; variants sit outside the prefix** —
  \`hover:zen-bg-zen-primary\`, \`data-[state=open]:zen-p-4\`, \`!zen-p-4\`. You
  rarely write these as a consumer, but if you extend a component's class, keep
  the prefix.
- **Theming is \`--zen-*\` custom properties — that is the whole public surface.**
  Override them in your own CSS. Three built-in themes switch via
  \`data-theme\`: \`default\`, \`zen-theme\`, \`dark\`.
- **Heavy components need an optional peer dep.** Chart wants \`recharts\`,
  RichText wants jodit, Map wants \`leaflet\`, Camera wants \`react-webcam\`. They
  lazy-load it; install it when you use one.`;

/** The shared body every copy carries: catalogue + divergences + rules. */
const body = (): string => `## How to choose a component

Each entry is the component's name and what it is *for*. Match the task to the
description, then import the name from your binding's package.

${renderCatalogue()}

${DIVERGENCES}

${RULES}
`;

const GENERATED_NOTICE = (from: string) =>
  `<!-- GENERATED FILE — do not edit by hand.
     Source: ${from}
     Regenerate: bun run gen:agent-guide  (checked by \`bun run check\`) -->`;

/** The repo-root copy: all four bindings, for an agent working in this repo. */
const rootDoc = (): string => {
  const bindingRows = BINDINGS.map(
    (b) => `| **${b.label}** | \`${b.pkg}\` | ${IDIOM[b.id]?.renderer ?? ""} |`,
  ).join("\n");
  const examples = BINDINGS.map(
    (b) => `**${b.label}**\n\n\`\`\`${b.id === "web-components" ? "tsx" : b.id === "react" || b.id === "solid" ? "tsx" : "ts"}\n${IDIOM[b.id]?.example ?? ""}\n\`\`\``,
  ).join("\n\n");

  return `${GENERATED_NOTICE("packages/react/src/nav.ts (via scripts/gen-agent-guide.ts)")}

# zen-ui for AI coding agents

zen-ui is one shadcn/Radix-style design system shipped as four framework
bindings that share one design core. A component present in one binding exists
in all of them — pick the binding that matches your app, then pick the
component from the catalogue below.

## Pick your binding

| Binding | Package | How you consume it |
|---|---|---|
${bindingRows}

${examples}

${body()}`;
};

/** A per-binding copy: that binding's idiom on top, then the shared body. */
const bindingDoc = (b: (typeof BINDINGS)[number]): string => {
  const idiom = IDIOM[b.id];
  const lang = b.id === "vanilla" ? "ts" : "tsx";
  return `${GENERATED_NOTICE("../../packages/react/src/nav.ts (via scripts/gen-agent-guide.ts)")}

# ${b.pkg} — for AI coding agents

The **${b.label}** binding of zen-ui. ${idiom?.renderer ?? ""}

zen-ui ships four bindings that share one API and one design core; this file is
for agents targeting **${b.label}**. The other bindings —
${BINDINGS.filter((o) => o.id !== b.id)
  .map((o) => `\`${o.pkg}\``)
  .join(", ")} — expose the same catalogue with their own idiom.

\`\`\`${lang}
${idiom?.example ?? ""}
\`\`\`

${body()}`;
};

/** Every file this generator owns: path on disk -> desired contents. */
const targets = (): Array<{ path: string; content: string }> => {
  const files: Array<{ path: string; content: string }> = [
    { path: resolve(root, "AGENTS.md"), content: rootDoc() },
  ];
  for (const b of BINDINGS) {
    files.push({ path: resolve(root, b.dir, "AGENTS.md"), content: bindingDoc(b) });
  }
  return files;
};

const check = process.argv.includes("--check");
let drift = 0;

for (const { path, content } of targets()) {
  const rel = path.replace(`${root}/`, "");
  if (check) {
    let current = "";
    try {
      current = readFileSync(path, "utf8");
    } catch {
      current = "";
    }
    const ok = current === content;
    if (!ok) drift++;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${rel}${ok ? "" : "  (stale — run `bun run gen:agent-guide`)"}`);
  } else {
    writeFileSync(path, content);
    console.log(`  wrote ${rel}`);
  }
}

if (check) {
  console.log(drift ? `\n${drift} FILE(S) STALE\n` : "\nall agent guides in sync\n");
  process.exit(drift ? 1 : 0);
}
