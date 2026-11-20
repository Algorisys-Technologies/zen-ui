<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# routing-graph — API (React, the parity reference)

Exports: `RoutingGraph`, `RoutingGraphProps`, `RoutingStep`, `RoutingStepStatus`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-routing-graph>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### RoutingGraph

- `steps: RoutingStep[]`
- `links: RoutingLink[]`
- `onLinksChange?: ((links: RoutingLink[]) => void) | undefined` — Makes the routing editable.
- `selected?: string | undefined`
- `onSelect?: ((id: string | undefined) => void) | undefined`
- `label?: string | undefined` — Names the graph. Defaults to "Routing".
- …plus the underlying element's standard props (278 inherited).

### RoutingStep (type)

- `id: string`
- `label: string`
- `detail?: string | undefined` — A second line: a workstation, a time.
- `status?: RoutingStepStatus | undefined`

### Other exports

- `RoutingStepStatus` = `"done" | "pending" | "skipped" | "active" | "blocked"`

### Types

- `RoutingGraphProps` — type (see the component above)
