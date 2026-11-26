# @algorisys/zen-ui-web-components

The Web Components binding of [zen-ui](https://github.com/Algorisys-Technologies/zen-ui) — an accessible component library for
native custom elements (`<zen-button>`, …) that work in any page or framework. One of four bindings (React, Solid, vanilla, Web Components) that share
one design core and one API.

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

Not on npm yet (Solid and React are). Install the prebuilt tarball:

```bash
npm i https://raw.githubusercontent.com/Algorisys-Technologies/zen-ui/refs/heads/dev/dist-pkg/zen-ui-web-components.tgz
```

`refs/heads/dev` follows the latest build; replace it with a commit hash to stay
on one release.

## Use

```html
<script type="module">
  import "@algorisys/zen-ui-web-components";        // registers every <zen-*> element
  import "@algorisys/zen-ui-web-components/styles";
</script>

<zen-button variant="solid" color="primary">Save</zen-button>
```

The catalogue, props and theming are in the [repository README](https://github.com/Algorisys-Technologies/zen-ui#readme).
`AGENTS.md` in this package is the guide for coding agents; the same guidance
ships as a skill under `skills/zen-ui`.

## Licence

Source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE) — free
for personal, hobby, educational, research, charity and government use.
**Commercial use needs a separate licence**: see [COMMERCIAL.md](COMMERCIAL.md).
This is not an open source licence.
