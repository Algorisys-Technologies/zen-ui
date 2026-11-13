<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# machine-state — API (React, the parity reference)

Exports: `MACHINE_STATES`, `isAvailabilityLoss`, `isMachineState`, `machineStateCategory`, `machineStateMessageKey`, `machineStateTone`, `MachineState`, `MachineStateCategory`, `MachineStateTone`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-machine-state>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Other exports

- `MACHINE_STATES: readonly ["running", "idle", "stopped", "fault", "waiting", "setup", "cleaning", "maintenance", "unknown"]`
- `isAvailabilityLoss(state: MachineState): boolean`
- `isMachineState(value: string): value is MachineState`
- `machineStateCategory(state: MachineState): MachineStateCategory`
- `machineStateMessageKey(state: MachineState): MessageKey`
- `machineStateTone(state: MachineState): MachineStateTone`
- `MachineState` = `"running" | "idle" | "stopped" | "fault" | "waiting" | "setup" | "cleaning" | "maintenance" | "unknown"`
- `MachineStateCategory` = `"productive" | "unplanned-loss" | "changeover" | "planned-stop" | "no-demand" | "no-data"`
- `MachineStateTone` = `"down" | "running" | "idle" | "setup" | "unknown" | "planned"`
