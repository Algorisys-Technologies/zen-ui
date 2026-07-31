# dist-pkg — the installable tarball

`zen-ui-react.tgz` is a build artifact committed on purpose. Consumers install it
directly off this branch:

```jsonc
// package.json
"@algorisys/zen-ui-react":
  "https://raw.githubusercontent.com/Algorisys-Technologies/zen-ui/refs/heads/feat/gantt/dist-pkg/zen-ui-react.tgz"
```

## Why a tarball rather than a git dependency

`npm i github:Algorisys-Technologies/zen-ui#feat/gantt` does not work, and the
reason is structural rather than fixable here: npm reads the **repo root**
`package.json`, which is this bun monorepo (`private: true`, `workspace:*`
deps), and there is no npm syntax for "install `packages/react` instead". npm
fails with `EUNSUPPORTEDPROTOCOL: Unsupported URL Type "workspace:"`. Yarn has
`#workspace=`; npm does not.

A tarball URL sidesteps it: npm extracts rather than cloning-and-preparing, so
the monorepo root is never read.

## Regenerating

```sh
./scripts/pack-dist-pkg.sh
git add dist-pkg/zen-ui-react.tgz && git commit && git push
```

**This does not update itself.** A stale tarball fails silently — consumers keep
building against the last packed version and simply do not see new components.
Re-pack whenever a consumer needs a change.

## When this goes away

This exists because the package is unpublished. Publishing `@algorisys/zen-ui-react`
to a registry (npm, or GitHub Packages for a scoped private package) makes it
unnecessary, and that is the better end state: real semver, no build output in
git, no 2 MB blob per rebuild in the history. Treat this as a bridge.
