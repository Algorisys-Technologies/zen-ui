# @algorisys/zen-ui-solid

The Solid binding of [zen-ui](https://github.com/Algorisys-Technologies/zen-ui) — an accessible component library for
SolidJS apps, on Kobalte primitives. Ships a server (SSR) build alongside the browser one. One of four bindings (React, Solid, vanilla, Web Components) that share
one design core and one API.

> **Beta — in active development and internal testing.** zen-ui is used in
> production in our own applications, but it is not yet a stable public release.
> Expect frequent releases. Breaking changes always get a major version and an
> upgrade note ([release notes](https://github.com/Algorisys-Technologies/zen-ui/tree/dev/release-notes)); pin an exact
> version rather than a range until this notice comes off.
>
> **This is the lead binding.** New components and fixes land here first, so
> `@algorisys/zen-ui-solid` is usually the newest version; the React, vanilla and
> Web Components bindings follow behind it.

## Install

Not on a public registry yet. Install the prebuilt tarball:

```bash
npm i https://raw.githubusercontent.com/Algorisys-Technologies/zen-ui/refs/heads/dev/dist-pkg/zen-ui-solid.tgz solid-js
```

`refs/heads/dev` follows the latest build; replace it with a commit hash to stay
on one release.

## Use

```tsx
import { Button } from "@algorisys/zen-ui-solid";
import "@algorisys/zen-ui-solid/styles";

<Button variant="solid" color="primary">Save</Button>;
```

The catalogue, props and theming are in the [repository README](https://github.com/Algorisys-Technologies/zen-ui#readme).
`AGENTS.md` in this package is the guide for coding agents; the same guidance
ships as a skill under `skills/zen-ui`.

## Licence

Source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE) — free
for personal, hobby, educational, research, charity and government use.
**Commercial use needs a separate licence**: see [COMMERCIAL.md](COMMERCIAL.md).
This is not an open source licence.
