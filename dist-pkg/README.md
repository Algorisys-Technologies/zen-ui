# dist-pkg — the installable tarballs

One tarball per binding, committed on purpose so a project on any stack can
install zen-ui without a registry. **Solid and React are on npm** — prefer
`npm i @algorisys/zen-ui-solid` / `@algorisys/zen-ui-react`; their tarballs here
are the exact files `scripts/publish-npm.sh` uploads, kept as a fallback.
Vanilla and Web Components are tarball-only for now:

| Stack | Install |
|---|---|
| SolidJS | `npm i https://raw.githubusercontent.com/Algorisys-Technologies/zen-ui/refs/heads/dev/dist-pkg/zen-ui-solid.tgz` |
| React | `npm i https://raw.githubusercontent.com/Algorisys-Technologies/zen-ui/refs/heads/dev/dist-pkg/zen-ui-react.tgz` |
| No framework | `npm i https://raw.githubusercontent.com/Algorisys-Technologies/zen-ui/refs/heads/dev/dist-pkg/zen-ui-vanilla.tgz` |
| Custom elements | `npm i https://raw.githubusercontent.com/Algorisys-Technologies/zen-ui/refs/heads/dev/dist-pkg/zen-ui-web-components.tgz` |

zen-ui is in **beta / internal testing**. Each binding has its own version and
**Solid leads**: it is packed on every Solid release, so `zen-ui-solid.tgz` is
usually the newest, and the others can be a few releases behind. The version is
in each tarball's `package.json`.

`refs/heads/dev` follows the latest pack. To stay on one release, replace it with
the commit hash that packed that release.

## Why a tarball rather than a git dependency

`npm i github:Algorisys-Technologies/zen-ui#dev` does not work, and the reason is
structural rather than fixable here: npm reads the **repo root** `package.json`,
which is this bun monorepo (`private: true`, `workspace:*` deps), and there is no
npm syntax for "install `packages/react` instead". npm fails with
`EUNSUPPORTEDPROTOCOL: Unsupported URL Type "workspace:"`. Yarn has
`#workspace=`; npm does not.

A tarball URL sidesteps it: npm extracts rather than cloning-and-preparing, so
the monorepo root is never read.

## Regenerating

```sh
./scripts/pack-dist-pkg.sh            # all four (vanilla is always packed before web-components)
./scripts/pack-dist-pkg.sh solid      # one binding — what "ship solid" runs
git add dist-pkg/ && git commit && git push
```

**This does not update itself.** A stale tarball fails silently — consumers keep
building against the last packed version and simply do not see new components.
Re-pack whenever a consumer needs a change. `*.tgz` is gitignored repo-wide;
`!dist-pkg/*.tgz` is what lets these through.

## When this goes away

This exists because not every binding is on npm yet. Once vanilla and Web
Components are published too, the tarballs become a fallback only, and dropping
them is the better end state: no build output in git, no multi-MB blob per
rebuild in the history. Until then, the Solid and React tarballs double as the
publish artifact — `publish-npm.sh` uploads the committed tarball, never a fresh
build, so npm and this folder cannot disagree.
