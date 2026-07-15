import { type JSX, For, Show, createSignal } from "solid-js";
import {
  THEMES,
  applyTheme,
  getInitialTheme,
  type ThemeName,
} from "@algorisys/zen-ui-core/theme";

/**
 * Demo links, resolved against the base this page is SERVED under.
 *
 * A bare "/builder/" is origin-absolute and only correct when the landing page
 * sits at the origin root. On GitHub Pages it is served from /zen-ui/, where
 * "/builder/" points at github.io/builder/ — off the deployment entirely. Vite
 * bakes BASE_URL in at build time ("/" in dev, "/zen-ui/" on Pages) and it
 * always ends in a slash, so this is correct in both without a special case.
 */
const demo = (app: string) => `${import.meta.env.BASE_URL}${app}/`;

type Status = "stable" | "alpha" | "planned";

interface Binding {
  name: string;
  package: string;
  status: Status;
  blurb: string;
  features: string[];
  demoHref?: string;
  repoHref?: string;
  installCmd?: string;
  accent: string;
  logo: JSX.Element;
}

const REACT_LOGO = (
  <svg viewBox="-11.5 -10.23174 23 20.46348" width="44" height="44">
    <circle r="2.05" fill="currentColor" />
    <g stroke="currentColor" stroke-width="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

const SOLID_LOGO = (
  <svg viewBox="0 0 166 155.3" width="44" height="44" fill="currentColor">
    <path d="M163,35S110-4,69,5l-3,1c-12,3-22,9-28,17l-2,3-15,26,26,5c11,7,25,10,38,7l46,9,32-37Z" />
    <path d="M152,42l-44-2c-12,0-24,2-34,8L43,75l-26-5L1,99c10,17,31,25,50,20l34-9c13-4,24-12,32-23l16-22L143,40Z" opacity=".3" />
    <path d="M133,76c-10-3-20-3-30,0L66,87l-26-5L1,99c10,17,31,25,50,20l34-9c13-4,24-12,32-23Z" opacity=".5" />
  </svg>
);

const VUE_LOGO = (
  <svg viewBox="0 0 261.76 226.69" width="44" height="44">
    <path
      fill="currentColor"
      d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z"
    />
    <path
      fill="currentColor"
      opacity=".5"
      d="M161.096.001l-30.225 52.351L100.647.001H52.346l78.526 136.01L209.398.001z"
    />
  </svg>
);

const SVELTE_LOGO = (
  <svg viewBox="0 0 98.1 118" width="44" height="44">
    <path
      fill="currentColor"
      d="M91.83 15.6C81.1 0.4 60-4.1 44.4 5.6L17 23.1c-7.5 4.7-12.6 12.4-14.1 21.1-1.3 7.3-.1 14.8 3.3 21.4-2.3 3.5-3.9 7.4-4.6 11.6-1.5 8.9.6 18 5.8 25.4 10.7 15.2 31.9 19.7 47.4 10l27.4-17.5c7.5-4.7 12.6-12.4 14.1-21.1 1.3-7.3.1-14.8-3.3-21.4 2.3-3.5 3.9-7.4 4.6-11.6 1.5-8.9-.5-18.1-5.8-25.4z"
    />
  </svg>
);

const BINDINGS: Binding[] = [
  {
    name: "React",
    package: "@algorisys/zen-ui-react",
    status: "stable",
    blurb:
      "57 primitives on Radix UI, react-hook-form + Zod, TanStack Table + Virtual. Built first; treated as the reference binding.",
    features: [
      "Radix-backed compound APIs",
      "DataTable with virtualization",
      "Inline editing + column DnD",
      "shadcn-style asChild via Slot",
    ],
    demoHref: demo("builder"),
    repoHref: "https://github.com/Algorisys-Technologies/zen-ui/tree/main/packages/react",
    installCmd: "npm install @algorisys/zen-ui-react",
    accent: "var(--zen-color-info)",
    logo: REACT_LOGO,
  },
  {
    name: "SolidJS",
    package: "@algorisys/zen-ui-solid",
    status: "alpha",
    blurb:
      "57 primitives on Kobalte, @modular-forms/solid, @tanstack/solid-table + virtual, @thisbeyond/solid-dnd. Signal-native, byte-for-byte the same theme.",
    features: [
      "Kobalte-backed compound APIs",
      "DataTable at React parity",
      "Polymorphic `as` (no Slot)",
      "Shares core tokens + UnoCSS preset",
    ],
    demoHref: demo("builder-solid"),
    repoHref: "https://github.com/Algorisys-Technologies/zen-ui/tree/main/packages/solid",
    installCmd: "npm install @algorisys/zen-ui-solid",
    accent: "var(--zen-color-success)",
    logo: SOLID_LOGO,
  },
  {
    name: "Vue",
    package: "@algorisys/zen-ui-vue",
    status: "planned",
    blurb:
      "Composition-API binding planned. Will likely lean on Radix Vue / Reka UI for primitives and VueUse helpers — same tokens + UnoCSS preset from core.",
    features: [
      "Radix Vue / Reka UI primitives",
      "Composition API + script setup",
      "Same theme tokens",
      "Coming after Solid stabilises",
    ],
    accent: "var(--zen-color-warning)",
    logo: VUE_LOGO,
  },
  {
    name: "Svelte",
    package: "@algorisys/zen-ui-svelte",
    status: "planned",
    blurb:
      "Svelte 5 / runes binding under consideration. Bits UI or melt-ui look like the strongest primitive bases. No commitment yet.",
    features: [
      "Svelte 5 runes",
      "bits-ui / melt-ui primitives",
      "Same theme tokens",
      "Under evaluation",
    ],
    accent: "var(--zen-color-accent-magenta)",
    logo: SVELTE_LOGO,
  },
];

const StatusBadge = (props: { status: Status }) => {
  const styles: Record<Status, { label: string; class: string }> = {
    stable: {
      label: "Stable",
      class:
        "bg-zen-success-soft text-zen-success-soft-fg border border-zen-success-soft",
    },
    alpha: {
      label: "Alpha",
      class:
        "bg-zen-warning-soft text-zen-warning-soft-fg border border-zen-warning-soft",
    },
    planned: {
      label: "Planned",
      class:
        "bg-zen-muted text-zen-muted-fg border border-zen-border",
    },
  };
  return (
    <span
      class={`inline-flex items-center gap-1 px-2 py-0.5 rounded-zen-full text-xs font-medium ${styles[props.status].class}`}
    >
      <span class="w-1.5 h-1.5 rounded-zen-full bg-current opacity-70" />
      {styles[props.status].label}
    </span>
  );
};

const Card = (props: { binding: Binding }) => {
  const b = () => props.binding;
  const isDisabled = () => b().status === "planned";
  return (
    <article
      class={`relative rounded-zen-lg border border-zen-border bg-zen-background p-6 shadow-zen-sm transition-shadow ${
        isDisabled() ? "opacity-80" : "hover:shadow-zen-md"
      }`}
    >
      <div class="flex items-start justify-between mb-4">
        <div
          class="inline-flex items-center justify-center h-14 w-14 rounded-zen-md"
          style={{ color: b().accent, background: "var(--zen-color-muted)" }}
        >
          {b().logo}
        </div>
        <StatusBadge status={b().status} />
      </div>

      <header class="mb-3">
        <h3 class="text-xl font-semibold m-0">{b().name}</h3>
        <code class="block mt-1 text-xs text-zen-muted-fg">{b().package}</code>
      </header>

      <p class="text-sm text-zen-foreground/85 leading-relaxed mb-4 min-h-[6rem]">
        {b().blurb}
      </p>

      <ul class="list-none p-0 mb-5 space-y-1.5">
        <For each={b().features}>
          {(f) => (
            <li class="text-sm text-zen-muted-fg pl-5 relative">
              <span
                class="absolute left-0 top-1.5 w-2 h-2 rounded-zen-full"
                style={{ "background-color": b().accent }}
              />
              {f}
            </li>
          )}
        </For>
      </ul>

      <Show when={b().installCmd}>
        <pre class="m-0 mb-4 px-3 py-2 text-xs bg-zen-muted/60 rounded-zen-sm overflow-x-auto">
          <code>$ {b().installCmd}</code>
        </pre>
      </Show>

      <div class="flex items-center gap-2">
        <Show
          when={b().demoHref}
          fallback={
            <button
              type="button"
              disabled
              class="inline-flex items-center justify-center h-10 px-4 text-sm font-medium rounded-zen-md border border-zen-border bg-zen-muted text-zen-muted-fg cursor-not-allowed"
            >
              Demo coming
            </button>
          }
        >
          <a
            href={b().demoHref}
            class="inline-flex items-center justify-center h-10 px-4 text-sm font-medium rounded-zen-md bg-zen-primary text-zen-primary-fg no-underline hover:opacity-90 transition-opacity"
          >
            Open demo →
          </a>
        </Show>
        <Show when={b().repoHref}>
          <a
            href={b().repoHref}
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center justify-center h-10 px-4 text-sm font-medium rounded-zen-md border border-zen-border bg-zen-background text-zen-foreground no-underline hover:bg-zen-muted transition-colors"
          >
            Source
          </a>
        </Show>
      </div>
    </article>
  );
};

const ThemeSwitcher = () => {
  const [theme, setTheme] = createSignal<ThemeName>(getInitialTheme());
  return (
    <label class="inline-flex items-center gap-2 text-xs text-zen-muted-fg">
      Theme
      <select
        value={theme()}
        onChange={(e) => {
          const next = e.currentTarget.value as ThemeName;
          setTheme(next);
          applyTheme(next);
        }}
        class="rounded-zen-sm border border-zen-border bg-zen-background px-2 py-1 text-sm text-zen-foreground"
      >
        <For each={THEMES}>
          {(t) => <option value={t.name}>{t.label}</option>}
        </For>
      </select>
    </label>
  );
};

const App = () => (
  <div class="min-h-full bg-zen-background text-zen-foreground">
    <header class="border-b border-zen-border">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center h-9 w-9 rounded-zen-md bg-zen-primary text-zen-primary-fg font-bold">
            Z
          </div>
          <div>
            <div class="text-base font-semibold leading-none">Zen UI</div>
            <div class="text-xs text-zen-muted-fg mt-0.5">
              Multi-framework component library
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <ThemeSwitcher />
          <a
            href="https://github.com/Algorisys-Technologies/zen-ui"
            target="_blank"
            rel="noreferrer"
            class="text-sm text-zen-muted-fg hover:text-zen-foreground no-underline"
          >
            GitHub →
          </a>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-12">
      <section class="text-center mb-12">
        <h1 class="text-4xl font-bold m-0 leading-tight">
          One design system. Multiple framework bindings.
        </h1>
        <p class="text-lg text-zen-muted-fg mt-4 max-w-2xl mx-auto">
          Shared design tokens, UnoCSS preset, and theme primitives in{" "}
          <code class="text-zen-foreground">@algorisys/zen-ui-core</code>. Each
          framework gets its own headless-style component library on top —
          same look, same feel, same theme switching.
        </p>
        <div class="flex items-center justify-center gap-3 mt-6">
          <a
            href={demo("builder")}
            class="inline-flex items-center justify-center h-11 px-6 text-sm font-medium rounded-zen-md bg-zen-primary text-zen-primary-fg no-underline hover:opacity-90"
          >
            Try the React demo
          </a>
          <a
            href={demo("builder-solid")}
            class="inline-flex items-center justify-center h-11 px-6 text-sm font-medium rounded-zen-md border border-zen-border bg-zen-background text-zen-foreground no-underline hover:bg-zen-muted"
          >
            Try the Solid demo
          </a>
        </div>
      </section>

      <section>
        <div class="flex items-baseline justify-between mb-4">
          <h2 class="text-xl font-semibold m-0">Bindings</h2>
          <span class="text-xs text-zen-muted-fg">
            2 shipped · 2 planned
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <For each={BINDINGS}>{(b) => <Card binding={b} />}</For>
        </div>
      </section>

      <section class="mt-16">
        <h2 class="text-xl font-semibold mb-4">How the pieces fit</h2>
        <div class="rounded-zen-md border border-zen-border bg-zen-background p-6 text-sm leading-relaxed">
          <pre class="m-0 text-xs overflow-x-auto">
{`zen-ui/
├── packages/
│   ├── core/                  # @algorisys/zen-ui-core
│   │   ├── styles/tokens.css       # design tokens
│   │   ├── styles/preflight.css    # element reset
│   │   ├── src/cn.ts               # clsx + tailwind-merge
│   │   ├── src/theme.ts            # DOM theme primitives
│   │   └── src/uno-preset.ts       # zenUnoTheme + postprocess
│   ├── react/                 # @algorisys/zen-ui-react (stable)
│   └── solid/                 # @algorisys/zen-ui-solid (alpha)
└── apps/
    └── landing/               # this page
`}
          </pre>
          <p class="mt-4 m-0 text-zen-muted-fg">
            Every binding depends on <code>core</code> via{" "}
            <code>workspace:*</code>. Tokens and the UnoCSS preset are the
            single source of truth — switch the theme in this page's header
            dropdown and every binding's demo picks up the change via the
            shared <code>zen:theme-change</code> event protocol.
          </p>
        </div>
      </section>
    </main>

    <footer class="border-t border-zen-border mt-12">
      <div class="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-zen-muted-fg">
        <span>Built by Algorisys Technologies. MIT-style internal use.</span>
        <span>v{__ZEN_VERSION__} · {new Date().getFullYear()}</span>
      </div>
    </footer>
  </div>
);

export default App;
