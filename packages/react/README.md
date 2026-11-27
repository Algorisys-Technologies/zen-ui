# @algorisys/zen-ui-react

The React binding of [zen-ui](https://github.com/Algorisys-Technologies/zen-ui) — an accessible component library for
React apps, on Radix UI primitives. One of four bindings (React, Solid, vanilla, Web Components) that share
one design core and one API.

**[Live demo →](https://algorisys-technologies.github.io/zen-ui/builder/)** — every component, with code examples. [All bindings](https://algorisys-technologies.github.io/zen-ui/)

> **Beta — in active development and internal testing.** zen-ui is used in
> production in our own applications, but it is not yet a stable public release.
> Expect frequent releases. Breaking changes always get a major version and an
> upgrade note ([release notes](https://github.com/Algorisys-Technologies/zen-ui/tree/dev/release-notes)); pin an exact
> version rather than a range until this notice comes off.
>
> **Solid leads; this binding follows.** Each binding is versioned on its own, and
> new work lands in `@algorisys/zen-ui-solid` first. This package's version can be a
> few releases behind Solid's, so a component in the Solid release notes may not be
> here yet — check the version you installed.

## Install

```bash
npm i @algorisys/zen-ui-react react react-dom
```

Pin an exact version while zen-ui is in beta. The same build is also available
as a tarball, if you cannot reach the npm registry:
`npm i https://raw.githubusercontent.com/Algorisys-Technologies/zen-ui/refs/heads/dev/dist-pkg/zen-ui-react.tgz`

## Use

```tsx
import { Button } from "@algorisys/zen-ui-react";
import "@algorisys/zen-ui-react/styles";

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
