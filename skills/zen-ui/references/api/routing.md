<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# routing — API (React, the parity reference)

Exports: `canAddLink`, `effectiveLinks`, `routingLayout`, `startableSteps`, `wouldCreateCycle`, `LinkRefusal`, `RoutingLayout`, `RoutingLink`, `RoutingStepInput`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-routing>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### RoutingLink (type)

- `from: string`
- `to: string`

### RoutingStepInput (type)

- `id: string`

### Other exports

- `canAddLink(steps: readonly RoutingStepInput[], links: readonly RoutingLink[], from: string, to: string): { ok: boolean; reason: LinkRefusal | null; }`
- `effectiveLinks(steps: readonly RoutingStepInput[], links: readonly RoutingLink[]): { links: RoutingLink[]; implicit: boolean; }`
- `routingLayout<S extends RoutingStepInput>(steps: readonly S[], links: readonly RoutingLink[]): RoutingLayout<S>`
- `startableSteps(steps: readonly RoutingStepInput[], links: readonly RoutingLink[], done: ReadonlySet<string>): string[]`
- `wouldCreateCycle(links: readonly RoutingLink[], from: string, to: string): boolean`
- `LinkRefusal` = `"unknown" | "self" | "duplicate" | "cycle"`
- `RoutingLayout` = `RoutingLayout<S>`
