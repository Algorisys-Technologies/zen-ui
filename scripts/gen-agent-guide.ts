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
 * It writes FIFTEEN files from that one source:
 *   - AGENTS.md at the repo root — for an agent working in this repo, and the
 *     canonical copy.
 *   - packages/<binding>/AGENTS.md — one per binding, so a consumer's agent
 *     finds it in node_modules. Each carries that binding's own consume-idiom
 *     header (JSX vs factory vs custom element) above the shared catalogue.
 *     These are in each package's `files` allowlist, so they publish.
 *   - skills/zen-ui/SKILL.md + references/catalogue.md — the same content as a
 *     Claude Code skill. AGENTS.md is the passive layer (read if the agent
 *     looks in node_modules); the skill is the active one — its description
 *     triggers loading whenever the agent builds UI in a consuming project.
 *     One skill for all four bindings: picking the binding is step 1 inside it.
 *     The catalogue is a lazy-loaded reference so SKILL.md stays token-cheap.
 *   - packages/<binding>/skills/zen-ui/* — the SAME two skill files, copied
 *     into each binding so they publish (each package's `files` lists
 *     `skills`). Identical on purpose: it is one skill that begins by picking
 *     the binding, so a consumer installs it from whichever package they have
 *     (`cp -r node_modules/@algorisys/zen-ui-<b>/skills/zen-ui .claude/skills/`)
 *     and gets the same thing four ways.
 *
 * Usage:
 *   bun run scripts/gen-agent-guide.ts            # write the files
 *   bun run scripts/gen-agent-guide.ts --check    # assert they are in sync (CI)
 *
 * The --check mode is wired into `bun run check`. It regenerates in memory and
 * diffs against disk, so a component added to nav.ts without regenerating this
 * fails the same gate as any other drift — that is the "kept updated" contract.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

/**
 * The Claude Code skill. Same source of truth, different activation: the
 * `description` frontmatter makes an agent load this on its own whenever it
 * builds UI in a project that depends on a zen-ui package — no wiring in the
 * consumer's CLAUDE.md needed. The body is workflow-shaped (what to check, in
 * what order, what fails silently) rather than catalogue-shaped; the catalogue
 * itself is a reference file the agent reads only when choosing a component.
 *
 * The generated-file notice sits AFTER the frontmatter — an HTML comment above
 * the opening `---` would stop the frontmatter parsing as frontmatter.
 */
const skillDoc = (): string => `---
name: zen-ui
description: Build UI with the zen-ui design system (@algorisys/zen-ui-react, -solid, -vanilla, -web-components). Use when adding or modifying ANY user interface in a project that depends on a zen-ui package — forms, dialogs, tables, date/time pickers, navigation, dashboards, app shells — or when theming or styling such a project. Covers picking the right component, required style imports, theming via --zen-* tokens, and the API differences between the four bindings.
---

${GENERATED_NOTICE("packages/react/src/nav.ts (via scripts/gen-agent-guide.ts)")}

# Building UI with zen-ui

zen-ui is one shadcn/Radix-style design system shipped as four framework
bindings that share one design core. A component present in one binding exists
in all of them — roughly 80 families, from primitives (Button, Dialog, Select)
through data-heavy surfaces (DataTable, TreeTable, Pivot, PlanningCalendar) to
a full app frame (ShellBar, Sidebar, FlexibleColumnLayout, DynamicPage).

## Workflow

1. **Identify the binding** from the project's \`package.json\`:

   | Dependency | Binding | Idiom |
   |---|---|---|
   | \`@algorisys/zen-ui-react\` | React | JSX components (Radix-backed). The reference API. |
   | \`@algorisys/zen-ui-solid\` | Solid | JSX components (Kobalte-backed). Mirrors the React API. |
   | \`@algorisys/zen-ui-vanilla\` | Vanilla | Factories: props object in, handle out; \`handle.el\` is the DOM node. |
   | \`@algorisys/zen-ui-web-components\` | Web Components | \`<zen-*>\` custom elements; importing the package registers all of them. |

2. **Check the catalogue before building anything by hand.** Read
   [references/catalogue.md](references/catalogue.md) and match the task to a
   component's description. If zen-ui has it, use it — do not compose a
   date-range picker out of two inputs when \`DateRangePicker\` exists, and do
   not reach for raw shadcn/Radix alongside it.

3. **Read the component's API file before writing props.** Each family has
   [references/api/](references/api/)\`<family>.md\` — the real props with
   types and docs, extracted from the React source by the TypeScript compiler.
   [references/api/index.md](references/api/index.md) maps every export to its
   file. Do not guess prop names or variant values; guessed props fail
   silently as unknown attributes.

4. **Verify the setup rules below** — the failure they prevent is silent:
   the build passes and the page renders wrong.

## Setup rules (every binding)

- **The stylesheet import is mandatory.** Once, at the app entry:
  \`import "<pkg>/styles";\`. Without it components render completely unstyled —
  nothing errors, the build stays green.
- **The element reset is opt-in and separate**: \`import "<pkg>/preflight";\`.
  Do not add it to an app that has its own reset.
- **Heavy components need an optional peer dep**, lazy-loaded on use:
  Chart → \`recharts\`, RichText → jodit, Map → \`leaflet\` (+ \`react-leaflet\`
  in React), Camera → \`react-webcam\`. Install the dep when you use the
  component; without it the component has nothing to load.

${DIVERGENCES}

Same component, all four idioms:

\`\`\`tsx
// React / Solid
import { Button } from "@algorisys/zen-ui-react"; // or -solid
import "@algorisys/zen-ui-react/styles";
<Button variant="solid" color="primary">Save</Button>;
\`\`\`

\`\`\`ts
// Vanilla
import { Button } from "@algorisys/zen-ui-vanilla";
import "@algorisys/zen-ui-vanilla/styles";
const btn = Button({ variant: "solid", color: "primary", children: "Save" });
document.body.append(btn.el);
\`\`\`

\`\`\`html
<!-- Web Components (import "@algorisys/zen-ui-web-components" once) -->
<zen-button variant="solid" color="primary">Save</zen-button>
\`\`\`

## Theming and styling

- **Theming is \`--zen-*\` custom properties — that is the whole public
  surface.** Override them in the consuming app's CSS. Three built-in themes
  switch via \`data-theme\` on any ancestor: \`default\`, \`zen-theme\`, \`dark\`.
  Do not fork component source or patch generated CSS to restyle.
- **zen-ui's utilities are prefixed \`zen-\`** (\`zen-p-4\`,
  \`hover:zen-bg-zen-primary\`). The consuming app's Tailwind/UnoCSS does NOT
  generate these, so writing new \`zen-*\` classes in app code produces nothing.
  To adjust a component: pass \`className\`/\`class\` with the app's own
  utilities, or override \`--zen-*\` tokens.
- A dark panel inside a light page (or vice versa) is the \`Theme\` component /
  a nested \`data-theme\` — not manual color overrides.

## Pitfalls that fail silently

| Symptom | Cause |
|---|---|
| Everything renders unstyled, no errors | Missing \`import "<pkg>/styles"\` |
| Import error: \`DialogContent\` not exported (vanilla/wc) | Compound parts are React/Solid-only — use the family's single factory/element |
| Chart / RichText / Map / Camera renders nothing | Optional peer dep not installed |
| A \`zen-*\` class you wrote has no effect | Consumer builds don't generate prefixed utilities — use tokens or your own classes |
| Select code from a React example fails in Solid | API divergence — Solid's \`Select\` takes \`options\` |

## References

- [references/catalogue.md](references/catalogue.md) — the full component
  catalogue: every family, grouped, with a one-line "what it is for". Read it
  whenever choosing a component.
- [references/api/](references/api/) — one file per family with the real
  props (names, types, variant unions, JSDoc), generated from the React
  source types. \`index.md\` there maps every export to its file. Read the
  file for a component BEFORE using it; the props you remember from shadcn
  or Radix are not always the props here.
- Each installed package also ships \`AGENTS.md\` at its root (in
  \`node_modules/@algorisys/zen-ui-<binding>/AGENTS.md\`) with the same
  catalogue plus that binding's idiom.
`;

/** The skill's lazy-loaded catalogue reference — nav.ts descriptions, same as
 *  the AGENTS.md catalogue, kept out of SKILL.md so the always-loaded part
 *  stays small. */
const catalogueDoc = (): string => `${GENERATED_NOTICE("packages/react/src/nav.ts (via scripts/gen-agent-guide.ts)")}

# zen-ui component catalogue

Each entry is the component's name and what it is *for*. Match the task to the
description, then import the name from your binding's package.

${renderCatalogue()}
`;

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

> This package also ships the same guidance as a Claude Code **skill** that
> loads itself whenever an agent builds UI here. Install it once per project:
> \`cp -r node_modules/${b.pkg}/skills/zen-ui .claude/skills/\`

${body()}`;
};

/** Every file this generator owns: path on disk -> desired contents. */
const targets = (): Array<{ path: string; content: string }> => {
  const files: Array<{ path: string; content: string }> = [
    { path: resolve(root, "AGENTS.md"), content: rootDoc() },
    { path: resolve(root, "skills/zen-ui/SKILL.md"), content: skillDoc() },
    { path: resolve(root, "skills/zen-ui/references/catalogue.md"), content: catalogueDoc() },
  ];
  for (const b of BINDINGS) {
    files.push({ path: resolve(root, b.dir, "AGENTS.md"), content: bindingDoc(b) });
    // The published copy of the skill — identical per binding, see header.
    files.push({ path: resolve(root, b.dir, "skills/zen-ui/SKILL.md"), content: skillDoc() });
    files.push({
      path: resolve(root, b.dir, "skills/zen-ui/references/catalogue.md"),
      content: catalogueDoc(),
    });
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
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    console.log(`  wrote ${rel}`);
  }
}

if (check) {
  console.log(drift ? `\n${drift} FILE(S) STALE\n` : "\nall agent guides in sync\n");
  process.exit(drift ? 1 : 0);
}
